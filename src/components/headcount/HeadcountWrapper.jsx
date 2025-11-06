// src/components/headcount/HeadcountWrapper.jsx - IMPROVED DESIGN
"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  ArrowRight, 
  Grid3x3, 
  List,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  UserCheck,
  Clock
} from 'lucide-react';
import { useTheme } from "../common/ThemeProvider";
import { useReferenceData } from "../../hooks/useReferenceData";
import { useEmployees } from "../../hooks/useEmployees";
import HeadcountTable from "./HeadcountTable";

const HeadcountWrapper = () => {
  const { darkMode } = useTheme();
  const [selectedView, setSelectedView] = useState('dashboard');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const { businessFunctions, loading: refLoading } = useReferenceData();
  const { statistics, fetchStatistics, loading } = useEmployees();

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Check if loading properly - ONLY check critical loaders
  const isRefDataLoading = useMemo(() => {
    if (typeof refLoading === 'object') {
      return refLoading.businessFunctions === true;
    }
    return refLoading === true;
  }, [refLoading]);

  const isStatsLoading = useMemo(() => {
    if (typeof loading === 'object') {
      return loading.statistics === true;
    }
    return loading === true;
  }, [loading]);

  const isLoading = isRefDataLoading || isStatsLoading;

  // Check if we have the minimum required data
  const hasRequiredData = useMemo(() => {
    return businessFunctions && 
           Array.isArray(businessFunctions) && 
           businessFunctions.length > 0;
  }, [businessFunctions]);

  // Helper function to generate colors based on index (fallback)
  const generateColorForIndex = useCallback((index) => {
    const colors = [
      '#30539b', '#336fa5', '#4e7db5', '#38587d', '#253360',
      '#7a829a', '#90a0b9', '#4f5772', '#2346A8', '#1e3a8a',
    ];
    return colors[index % colors.length];
  }, []);

  // Transform Companys into company cards with statistics
  const companyCards = useMemo(() => {
    if (!businessFunctions || businessFunctions.length === 0) return [];
    
    return businessFunctions
      .filter(bf => bf.is_active)
      .map((bf, index) => {
        const bfStats = statistics?.by_business_function?.[bf.name] || {};
        
        // Use color from backend if available, otherwise generate one
        const color = bf.color || generateColorForIndex(index);
        
        return {
          code: bf.code,
          name: bf.name,
          id: bf.id,
          color: color,
          totalEmployees: bfStats.count || bf.employee_count || 0,
          activeEmployees: bfStats.active || 0,
          vacantPositions: 0,
          departments: 0,
          recentHires: 0
        };
      })
      .sort((a, b) => b.totalEmployees - a.totalEmployees);
  }, [businessFunctions, statistics, generateColorForIndex]);

  // Calculate totals across all companies
  const totals = useMemo(() => {
    return {
      totalCompanies: companyCards.length,
      totalEmployees: statistics?.total_employees || 0,
      activeEmployees: statistics?.active_employees || 0,
      inactiveEmployees: statistics?.inactive_employees || 0,
      recentHires: statistics?.recent_hires_30_days || 0,
      contractEnding: statistics?.upcoming_contract_endings_30_days || 0
    };
  }, [companyCards, statistics]);

  const handleCompanySelect = useCallback((company) => {
    setSelectedCompany(company);
    setSelectedView('company');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedView('dashboard');
    setSelectedCompany(null);
  }, []);

  const handleViewAll = useCallback(() => {
    setSelectedView('all');
    setSelectedCompany(null);
  }, []);

  // Improved Theme classes with softer colors
  const bgPrimary = darkMode ? "bg-gray-900" : "bg-gray-50";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgCardHover = darkMode ? "bg-gray-750" : "bg-gray-50";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-500" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBorder = darkMode ? "hover:border-gray-600" : "hover:border-gray-300";

  // Company Card Component - Refined Design
  const CompanyCard = ({ company, onClick }) => (
    <div
      onClick={() => onClick(company)}
      className={`group relative ${bgCard} rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border ${borderColor} ${hoverBorder}`}
    >
      {/* Subtle top accent */}
      <div 
        className="h-1 w-full" 
        style={{ backgroundColor: company.color }}
      />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm"
              style={{ backgroundColor: company.color }}
            >
              {company.code}
            </div>
            <div>
              <h3 className={`font-semibold ${textPrimary} text-sm leading-tight`}>
                {company.name}
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                {company.code}
              </p>
            </div>
          </div>
          <ArrowRight 
            className={`${textMuted} group-hover:text-almet-sapphire transition-all flex-shrink-0`}
            size={18}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-1">
              <Users size={14} className={textMuted} />
              <div className="flex justify-center items-center gap-1">
                <p className={`text-sm font-bold ${textPrimary}`}>
              {company.totalEmployees}
            </p>    <span className={`text-xs ${textMuted}`}>Total</span>
              </div>
          
            </div>
            
      
          </div>
          
          <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-1">
              <Briefcase size={14} className={textMuted} />
 
              <div className="flex justify-center items-center gap-1">
                 <p className={`text-sm font-bold ${textPrimary}`}>
              {company.vacantPositions}
            </p><span className={`text-xs ${textMuted}`}>Vacant</span>
              </div>
              
            </div>
           
      
          </div>
        </div>

        {/* Recent Hires Badge */}
        {company.recentHires > 0 && (
          <div className={`mt-3 pt-3 border-t ${borderColor}`}>
            <div className="flex items-center text-xs">
              <TrendingUp size={12} className="mr-1.5 text-green-500" />
              <span className={textSecondary}>
                {company.recentHires} new hire{company.recentHires > 1 ? 's' : ''} this month
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // All Companies Card - Refined Design
  const AllCompaniesCard = ({ onClick }) => (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Building2 className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm leading-tight">
                All Companies
              </h3>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Combined view
              </p>
            </div>
          </div>
          <ArrowRight 
            className="text-blue-100/80 group-hover:text-white transition-all flex-shrink-0" 
            size={18} 
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <Users size={14} className="text-blue-100/80" />
              <div className="flex justify-center items-center gap-1">
                <p className="text-sm font-bold text-white">
              {totals.totalEmployees}
            </p>
              <span className="text-xs text-blue-100/80">Total</span>
              </div>
            </div>
            
            <p className="text-xs text-blue-100/80 mt-0.5">
              {totals.activeEmployees} active
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <Building2 size={14} className="text-blue-100/80" />
              <div className="flex justify-center items-center gap-1">
                <p className="text-sm font-bold text-white">
              {totals.totalCompanies}
            </p> <span className="text-xs text-blue-100/80">Companies</span>
              </div>
             
            </div>
            
            <p className="text-xs text-blue-100/80 mt-0.5">business codes</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading only if we don't have required data AND still loading
  if (!hasRequiredData && isRefDataLoading) {
    return (
      <div className={`min-h-screen ${bgPrimary} flex items-center justify-center`}>
        <div className="text-center">
          <RefreshCw className={`w-10 h-10 ${textSecondary} animate-spin mx-auto mb-3`} />
          <p className={`text-sm ${textSecondary}`}>Loading companies...</p>
        </div>
      </div>
    );
  }

  // If no data after loading completes
  if (!hasRequiredData) {
    return (
      <div className={`min-h-screen ${bgPrimary} flex items-center justify-center p-6`}>
        <div className={`${bgCard} rounded-xl p-8 border ${borderColor} text-center `}>
          <AlertCircle className={`w-12 h-12 ${textMuted} mx-auto mb-4`} />
          <h2 className={`text-lg font-semibold ${textPrimary} mb-2`}>No Companies Found</h2>
          <p className={`text-sm ${textSecondary} mb-4`}>
            No Companys are configured yet.
          </p>
          <button
            onClick={() => window.location.href = '/structure/settings'}
            className="px-4 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (selectedView === 'dashboard') {
    return (
      <div className={`min-h-screen  p-5`}>
        <div className=" mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>
                  Workforce Management
                </h1>
                <p className={`text-sm ${textSecondary}`}>
                  Select a company to manage employees and positions
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className={`flex items-center space-x-1 ${bgCard} rounded-lg p-1 border ${borderColor}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-almet-sapphire/10 text-almet-sapphire' 
                      : `${textMuted} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all text-sm ${
                    viewMode === 'list' 
                      ? 'bg-almet-sapphire/10 text-almet-sapphire' 
                      : `${textMuted} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4 justify-center items-center">
                       <p className={`text-2xl font-bold ${textPrimary}`}>
                {totals.totalCompanies}
              </p><p className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                  Companies
                </p>
                </div>
                
                <Building2 size={16} className={textMuted} />
              </div>
           
            </div>
            
            <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4 justify-center items-center"><p className={`text-2xl font-bold ${textPrimary}`}>
                {totals.totalEmployees}
              </p>
                    <p className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                  Total Employees
                </p>
                </div>
                
                <Users size={16} className={textMuted} />
              </div>
              
            </div>
            
            <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4 justify-center items-center"><p className="text-2xl font-bold text-green-600">
                {totals.activeEmployees}
              </p>
                   <p className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                  Active
                </p>   
                </div>
              
                <UserCheck size={16} className="text-green-500" />
              </div>
              
            </div>
            
            <div className={`${bgCard} rounded-lg p-3 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4 justify-center items-center"> <p className="text-2xl font-bold text-blue-600">
                {totals.recentHires}
              </p>
                 <p className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                  Recent Hires
                </p>    
                </div>
               
                <Clock size={16} className="text-blue-500" />
              </div>
             
              <p className={`text-xs ${textMuted} mt-1`}>Last 30 days</p>
            </div>
          </div>

          {/* Company Cards Grid */}
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          } gap-4`}>
            <AllCompaniesCard key="all-companies" onClick={handleViewAll} />
            {companyCards.map((company) => (
              <CompanyCard
                key={`company-${company.id}-${company.code}`}
                company={company}
                onClick={handleCompanySelect}
              />
            ))}
          </div>

          {/* Empty State */}
          {companyCards.length === 0 && (
            <div className={`${bgCard} rounded-xl p-8 border ${borderColor} text-center mt-6`}>
              <AlertCircle className={`w-10 h-10 ${textMuted} mx-auto mb-3`} />
              <p className={`text-sm ${textSecondary} mb-2`}>No companies found</p>
              <p className={`text-xs ${textMuted}`}>
                Add Companys in settings to get started
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // All Companies View or Company-Specific View
  return (
    <div className={`min-h-screen  `}>
      <div className="mx-auto">
        {/* Back Button */}
        <div className="mb-2">
          <button
            onClick={handleBackToDashboard}
            className={`flex items-center space-x-2 text-sm ${textSecondary} hover:${textPrimary} transition-colors group`}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Company Header Banner */}
        {selectedView === 'company' && selectedCompany && (
          <div 
            className="rounded-xl p-3 mb-3 text-white relative overflow-hidden"
            style={{ backgroundColor: selectedCompany.color }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold text-lg">
                    {selectedCompany.code}
                  </div>
                  <div>
                    <h1 className="text-base font-bold mb-0.5">
                      {selectedCompany.name}
                    </h1>
                    <p className="text-white/80 text-sm">
                      {selectedCompany.code} • {selectedCompany.totalEmployees} employees
                    </p>
                  </div>
                </div>
                
             
              </div>
            </div>
          </div>
        )}

        {/* Table Component */}
        <HeadcountTable 
          businessFunctionFilter={selectedView === 'company' ? selectedCompany?.code : null} 
        />
      </div>
    </div>
  );
};

export default HeadcountWrapper;