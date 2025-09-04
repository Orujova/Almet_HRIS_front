'use client';
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Settings, Users, Target, ChevronRight
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

  // Theme classes
  const bgApp = darkMode ? 'bg-gray-900' : 'bg-almet-mystic';
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-gray-200';

  const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary' }) => {
    const variants = {
      primary: 'bg-almet-sapphire hover:bg-almet-astral text-white shadow-lg',
      secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white shadow-md',
      outline: 'border-2 border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white'
    };

    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-sm transition-all duration-300 transform hover:-translate-y-1 ${variants[variant]}`}
      >
        <Icon size={18} />
        {label}
      </button>
    );
  };

  if (showSettings) return <AssessmentSettings onBack={() => setShowSettings(false)} />;

  return (
    <div className={`min-h-screen ${bgApp} py-8`}>
      <div className="mx-auto space-y-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className={`flex flex-col lg:flex-row lg:items-center lg:justify-between ${bgCard} rounded-3xl p-8 shadow-2xl border ${borderColor} transition-all duration-300`}>
          <div className="space-y-3">
            <h1 className={`text-2xl font-extrabold ${textPrimary} flex items-center gap-3`}>
              <div className="p-3 bg-almet-sapphire bg-opacity-15 rounded-2xl">
                <BarChart3 className="w-5 h-6 text-almet-sapphire" />
              </div>
              Assessment Matrix
            </h1>
            <p className={`text-sm ${textSecondary}`}>
              Comprehensive employee competency assessment and evaluation system
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-6 lg:mt-0">
            <ActionButton
              onClick={() => setShowSettings(true)}
              icon={Settings}
              label="Settings"
              variant="outline"
            />
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className={`${bgCard} rounded-3xl p-3 shadow-xl border ${borderColor} transition-all duration-300`}>
          <div className="flex flex-col lg:flex-row gap-3">
            {[
              {
                key: 'behavioral',
                icon: Users,
                title: 'Behavioral Assessment',
                subtitle: 'Employee behavioral competencies'
              },
              {
                key: 'core',
                icon: Target,
                title: 'Core Employee Assessment',
                subtitle: 'Technical skills evaluation'
              }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all duration-300 w-full justify-between ${
                  activeView === tab.key
                    ? 'bg-almet-sapphire text-white shadow-lg scale-105'
                    : `${textSecondary} hover:${textPrimary} hover:bg-almet-mystic hover:shadow-md`
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={20} />
                  <div className="text-left">
                    <div className="text-sm font-semibold">{tab.title}</div>
                    <div className="text-xs opacity-75">{tab.subtitle}</div>
                  </div>
                </div>
                <ChevronRight size={18} className={activeView === tab.key ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
              </button>
            ))}
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
