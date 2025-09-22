'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Target, ArrowRight, Loader2, AlertCircle, Settings,
  RefreshCw, ChevronDown, ChevronRight
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import BehavioralAssessmentCalculation from '@/components/assessment/BehavioralAssessmentCalculation';
import CoreEmployeeCalculation from '@/components/assessment/CoreEmployeeCalculation';
import AssessmentSettings from '@/components/assessment/AssessmentSettings';
import { assessmentApi } from '@/services/assessmentApi';
import { ToastProvider, useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';

const AssessmentMatrixInner = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  
  // TAB STATE-NI STORAGE-DƏ SAXLA
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
    totalAssessments: 0,
    completedAssessments: 0
  });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'default'
  });

  // TAB DEYİŞƏNDƏ STORAGE-Ə YARAT
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
      className={`w-full p-6 rounded-xl text-left transition-all duration-200 hover:shadow-lg group ${
        isActive
          ? `bg-gradient-to-br ${color} text-white shadow-xl`
          : `${bgCard} border ${borderColor} ${textPrimary} hover:border-almet-sapphire hover:shadow-md`
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${
          isActive ? 'bg-white/20' : 'bg-almet-sapphire bg-opacity-10'
        }`}>
          <Icon className={`w-6 h-6 ${
            isActive ? 'text-white' : 'text-almet-sapphire'
          }`} />
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isActive ? 'bg-white/20 text-white' : 'bg-almet-sapphire bg-opacity-10 text-almet-sapphire'
            }`}>
              {count}
            </span>
          )}
          <ArrowRight className={`w-5 h-5 transition-transform duration-200 ${
            isActive ? 'rotate-0' : 'group-hover:translate-x-1'
          }`} />
        </div>
      </div>
      
      <h3 className="font-bold text-base mb-2">{title}</h3>
      <p className={`text-sm ${
        isActive ? 'text-white/90' : textSecondary
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
        <div className={`${bgCard} border ${borderColor} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Assessment Matrix</h2>
              <p className={`text-sm ${textSecondary} mt-1`}>Employee competency assessment system</p>
            </div>
            <ActionButton
              onClick={() => setShowSettings(true)}
              icon={Settings}
              label="Settings"
              variant="outline"
            />
          </div>
        </div>
        
        <div className={`min-h-96 flex items-center justify-center ${bgCard} border ${borderColor} rounded-xl p-12`}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-almet-sapphire" />
            <p className={`${textPrimary} font-semibold`}>Loading assessment data...</p>
            <p className={`${textSecondary} text-sm mt-1`}>Please wait</p>
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
              <p className={`text-sm ${textSecondary} mt-1`}>Employee competency assessment system</p>
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
        
        <div className={`${bgCard} border border-red-200 rounded-xl p-6 shadow-sm`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500" size={24}/>
            <div className="flex-1">
              <h3 className="text-red-700 font-bold text-base">Error Loading Data</h3>
              <p className="text-sm text-red-600 mt-2">{error?.message || 'Failed to load assessment data.'}</p>
            </div>
            <ActionButton 
              icon={RefreshCw} 
              label="Try Again" 
              onClick={fetchDashboardData}
              variant="outline"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${bgCard} border ${borderColor} rounded-xl p-5 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>Assessment Matrix</h2>
            <p className={`text-sm ${textSecondary} mt-1`}>Employee competency assessment system</p>
          </div>
          <div className="flex items-center gap-2">
            {activeView !== 'dashboard' && (
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${darkMode ? 'bg-almet-comet hover:bg-almet-cloud-burst' : 'bg-almet-mystic hover:bg-gray-200'} ${textPrimary} hover:shadow-sm`}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Dashboard
              </button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NavigationCard
            icon={Users}
            title="Behavioral Assessment"
            subtitle="Evaluate employee behavioral competencies and soft skills"
            color="from-purple-500 via-purple-600 to-purple-700"
            count={dashboardData.behavioralAssessments}
            isActive={false}
            onClick={() => setActiveView('behavioral')}
          />
          
          <NavigationCard
            icon={Target}
            title="Core Employee Assessment"
            subtitle="Assess technical skills and core competencies"
            color="from-blue-500 via-blue-600 to-blue-700"
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