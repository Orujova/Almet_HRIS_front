// src/components/grading/ScenarioManager.jsx - Enhanced scenario management with tabs
import React, { useState } from "react";
import { Calculator, Archive, GitCompare, Eye, CheckCircle, Calendar, User, RefreshCw, Search, Filter, Plus } from "lucide-react";

const ScenarioManager = ({
  draftScenarios,
  archivedScenarios,
  currentData,
  compareMode,
  selectedForComparison,
  loading,
  handleViewDetails,
  handleSaveAsCurrent,
  handleArchiveDraft,
  toggleCompareMode,
  toggleScenarioForComparison,
  startComparison
}) => {
  const [activeTab, setActiveTab] = useState('drafts');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (value, decimals = 1) => {
    const numValue = value || 0;
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get scenarios based on active tab
  const getScenarios = () => {
    return activeTab === 'drafts' ? draftScenarios : archivedScenarios;
  };

  // Filter and sort scenarios
  const filteredAndSortedScenarios = getScenarios()
    .filter(scenario => 
      scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created_at":
          return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
        case "base_value":
          return (b.data?.baseValue1 || 0) - (a.data?.baseValue1 || 0);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedScenarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScenarios = filteredAndSortedScenarios.slice(startIndex, startIndex + itemsPerPage);

  // Reset pagination when changing tabs
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const MetricsDisplay = ({ scenario }) => {
    if (!scenario || !scenario.metrics) return null;

    const metrics = scenario.metrics;

    return (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Budget Impact:</span>
          <span className="font-medium">{formatCurrency(metrics.totalBudgetImpact)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Avg Increase:</span>
          <span className={`font-medium ${
            (metrics.avgSalaryIncrease || 0) > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {(metrics.avgSalaryIncrease || 0) > 0 ? '+' : ''}
            {(metrics.avgSalaryIncrease || 0).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Positions:</span>
          <span className="font-medium">{metrics.positionsAffected || 0}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with Tabs */}
      <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Calculator size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                Scenario Management
              </h2>
              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                Manage and compare your salary scenarios
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {compareMode && selectedForComparison.length >= 2 && (
              <button
                onClick={startComparison}
                className="bg-green-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Eye size={14} />
                Compare ({selectedForComparison.length})
              </button>
            )}
            <button
              onClick={toggleCompareMode}
              className={`px-4 py-2 text-sm rounded-lg border transition-all flex items-center gap-2 shadow-md ${
                compareMode 
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                  : 'bg-almet-sapphire text-white border-almet-sapphire hover:bg-almet-astral'
              }`}
            >
              <GitCompare size={14} />
              {compareMode ? 'Cancel Compare' : 'Compare Mode'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'drafts'
                ? 'bg-yellow-500 text-white shadow-sm'
                : 'text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-white'
            }`}
          >
            <Calculator size={14} />
            Draft Scenarios ({draftScenarios.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'archived'
                ? 'bg-gray-500 text-white shadow-sm'
                : 'text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-white'
            }`}
          >
            <Archive size={14} />
            Archived ({archivedScenarios.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Current Structure for comparison */}
        {compareMode && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-3">Include Current Structure:</h3>
            <div 
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedForComparison.includes('current')
                  ? "border-almet-sapphire bg-blue-50 dark:bg-blue-900/20 shadow-md"
                  : "border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300"
              }`}
              onClick={() => toggleScenarioForComparison('current')}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-sm text-almet-cloud-burst dark:text-white">Current Structure</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active grade structure from database</p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedForComparison.includes('current')}
                  onChange={() => toggleScenarioForComparison('current')}
                  className="w-4 h-4 text-almet-sapphire rounded focus:ring-almet-sapphire"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                    {formatPercentage(currentData?.verticalAvg)}
                  </div>
                  <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Vertical</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                    {formatPercentage(currentData?.horizontalAvg)}
                  </div>
                  <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Horizontal</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                    {formatCurrency(currentData?.baseValue1)}
                  </div>
                  <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base Value</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire"
            >
              <option value="created_at">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="base_value">Sort by Base Value</option>
            </select>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedScenarios.length > 0 ? (
            paginatedScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-5 rounded-lg border cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1 ${
                  compareMode && selectedForComparison.includes(scenario.id)
                    ? "border-almet-sapphire bg-blue-50 dark:bg-blue-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                }`}
                onClick={() => compareMode ? toggleScenarioForComparison(scenario.id) : handleViewDetails(scenario)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-almet-cloud-burst dark:text-white mb-2 line-clamp-1">
                      {scenario.name}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={10} />
                        {formatDate(scenario.createdAt || scenario.created_at)}
                      </div>
                      {scenario.createdBy && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <User size={10} />
                          {scenario.createdBy}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {compareMode && (
                      <input
                        type="checkbox"
                        checked={selectedForComparison.includes(scenario.id)}
                        onChange={() => toggleScenarioForComparison(scenario.id)}
                        className="w-4 h-4 text-almet-sapphire rounded focus:ring-almet-sapphire"
                      />
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      activeTab === 'drafts' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {activeTab === 'drafts' ? 'Draft' : 'Archived'}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-600">
                      {formatPercentage(scenario.data?.verticalAvg)}
                    </div>
                    <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Vertical</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-sm font-medium text-green-600">
                      {formatPercentage(scenario.data?.horizontalAvg)}
                    </div>
                    <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Horizontal</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="text-sm font-medium text-purple-600">
                      {formatCurrency(scenario.data?.baseValue1)}
                    </div>
                    <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base</div>
                  </div>
                </div>

                <MetricsDisplay scenario={scenario} />

                {!compareMode && activeTab === 'drafts' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveAsCurrent(scenario.id); }}
                      disabled={loading.applying}
                      className="flex-1 bg-almet-sapphire text-white px-3 py-2 text-xs rounded-lg hover:bg-almet-astral transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {loading.applying ? (
                        <RefreshCw size={10} className="animate-spin" />
                      ) : (
                        <CheckCircle size={10} />
                      )}
                      Apply
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleArchiveDraft(scenario.id); }}
                      disabled={loading.archiving}
                      className="bg-gray-400 text-white px-3 py-2 text-xs rounded-lg hover:bg-gray-500 transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {loading.archiving ? (
                        <RefreshCw size={10} className="animate-spin" />
                      ) : (
                        <Archive size={10} />
                      )}
                      Archive
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-3">
                {activeTab === 'drafts' ? (
                  <Calculator size={48} className="mx-auto" />
                ) : (
                  <Archive size={48} className="mx-auto" />
                )}
              </div>
              <h3 className="text-base font-medium text-almet-waterloo dark:text-almet-bali-hai mb-2">
                {searchTerm ? 'No scenarios found' : 
                 activeTab === 'drafts' ? 'No Draft Scenarios' : 'No Archived Scenarios'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                {searchTerm ? 'Try adjusting your search terms' : 
                 activeTab === 'drafts' ? 'Create your first scenario above' : 'No archived scenarios yet'}
              </p>
              {!searchTerm && activeTab === 'drafts' && (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-almet-sapphire text-white px-4 py-2 text-sm rounded-lg hover:bg-almet-astral transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={12} />
                  Create First Scenario
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    currentPage === page
                      ? `${activeTab === 'drafts' ? 'bg-yellow-500' : 'bg-gray-500'} text-white`
                      : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}

        {/* Results info */}
        {filteredAndSortedScenarios.length > 0 && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedScenarios.length)} of {filteredAndSortedScenarios.length} {activeTab === 'drafts' ? 'draft' : 'archived'} scenarios
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioManager;