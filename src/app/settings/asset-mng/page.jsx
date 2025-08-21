// src/app/asset-management/page.jsx - Complete Enhanced Asset Management Page with All APIs
"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { assetService, categoryService, employeeService, employeeAssetService } from "@/services/assetService";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Package,
  AlertCircle,
  Building,
  Loader,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  ChevronDown,
  Archive,
  BarChart3,
  Wrench,
  LogOut,
  RotateCcw,
  Grid3X3,
  List,
  Target,
  ChevronLeft,
  ChevronRight,
  Activity,
  Bell,
  MessageSquare,
  Ban,
  Reply,
  User,
  Calendar,
  Settings
} from "lucide-react";
import {
  AddAssetModal,
  EditAssetModal,
} from "@/components/assets/AssetManagementModals";
import {
  AssetDetailsModal,
} from "@/components/assets/AssetDetailsModal";
import {
  ChangeStatusModal
} from "@/components/assets/ChangeStatusModal";
import {
  CheckInAssetModal
} from "@/components/assets/CheckInAssetModal";
import {
  AssetStatsModal,
  AssignAssetModal,
  AssetActivitiesModal
} from "@/components/assets/EnhancedModals";
import CategoryManagement from "@/components/assets/CategoryManagement";
import EmployeeAssetActionModal from "@/components/assets/EmployeeAssetActionModal";
// Enhanced Notification Component
const NotificationToast = ({ message, type = 'success', onClose }) => {
  const { darkMode } = useTheme();
  
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
  const icon = type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />;

  return (
    <div className={`fixed top-4 right-4 z-[60] ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 ease-in-out`}>
      {icon}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1">
        <XCircle size={14} />
      </button>
    </div>
  );
};

// Clean Searchable Dropdown Component
const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  searchPlaceholder = "Search...",
  className = "",
  darkMode = false,
  icon = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs text-left flex items-center justify-between transition-all duration-200 hover:border-almet-sapphire/50`}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2 text-almet-sapphire">{icon}</span>}
          <span className={selectedOption ? textPrimary : textMuted}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-hidden`}>
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search size={12} className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-7 pr-2 py-1.5 border ${borderColor} rounded focus:ring-1 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs`}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className={`px-3 py-2 ${textMuted} text-xs text-center`}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full px-3 py-2 text-left ${hoverBg} ${textPrimary} text-xs transition-colors duration-150 ${
                    value === option.value ? 'bg-almet-sapphire/10 text-almet-sapphire' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};



const AssetManagementPage = () => {
  const { darkMode } = useTheme();
  
  // State management
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("-created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("assets");
  const [notification, setNotification] = useState(null);
  const itemsPerPage = 12;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEmployeeActionModal, setShowEmployeeActionModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [employeeActionType, setEmployeeActionType] = useState('');

  // Status choices
  const statusChoices = [
    { value: 'all', label: 'All Status' },
    { value: 'IN_STOCK', label: 'In Stock' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_USE', label: 'In Use' },
    { value: 'NEED_CLARIFICATION', label: 'Need Clarification' },
    { value: 'IN_REPAIR', label: 'In Repair' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  // Sort options
  const sortOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: 'asset_name', label: 'Name A-Z' },
    { value: '-asset_name', label: 'Name Z-A' },
    { value: 'purchase_price', label: 'Price Low-High' },
    { value: '-purchase_price', label: 'Price High-Low' }
  ];

  // Statistics
  const [assetStats, setAssetStats] = useState({
    total: 0,
    inStock: 0,
    inUse: 0,
    assigned: 0,
    needClarification: 0,
    inRepair: 0,
    archived: 0,
    totalValue: 0
  });

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgPage = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const shadowClass = "shadow-sm";
  const bgAccent = darkMode ? "bg-gray-700/30" : "bg-gray-50";

  // Utility function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      'IN_STOCK': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50',
      'IN_USE': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50',
      'ASSIGNED': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50',
      'NEED_CLARIFICATION': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50',
      'IN_REPAIR': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50',
      'ARCHIVED': 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700/50'
    };
    return statusColors[status] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700/50';
  };

  const getStatusIcon = (status) => {
    const iconProps = { size: 12 };
    switch (status) {
      case 'IN_USE': return <CheckCircle {...iconProps} />;
      case 'IN_STOCK': return <Package {...iconProps} />;
      case 'ASSIGNED': return <Clock {...iconProps} />;
      case 'NEED_CLARIFICATION': return <AlertCircle {...iconProps} />;
      case 'IN_REPAIR': return <Wrench {...iconProps} />;
      case 'ARCHIVED': return <Archive {...iconProps} />;
      default: return <Package {...iconProps} />;
    }
  };

  // Data fetching functions
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        search: searchTerm,
        ordering: sortBy
      };
      
      const response = await assetService.getAssets(params);
      setAssets(response.results || []);
      setTotalCount(response.count || 0);
      calculateStats(response.results || []);
    } catch (err) {
      setError("Failed to fetch assets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.results || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      setEmployees(response.results || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const calculateStats = (assetList) => {
    const stats = {
      total: assetList.length,
      inStock: 0,
      inUse: 0,
      assigned: 0,
      needClarification: 0,
      inRepair: 0,
      archived: 0,
      totalValue: 0
    };

    assetList.forEach(asset => {
      stats.totalValue += parseFloat(asset.purchase_price || 0);
      switch (asset.status) {
        case 'IN_STOCK': stats.inStock++; break;
        case 'IN_USE': stats.inUse++; break;
        case 'ASSIGNED': stats.assigned++; break;
        case 'NEED_CLARIFICATION': stats.needClarification++; break;
        case 'IN_REPAIR': stats.inRepair++; break;
        case 'ARCHIVED': stats.archived++; break;
      }
    });

    setAssetStats(stats);
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(category => ({
      value: category.name,
      label: category.name
    }))
  ];

  useEffect(() => {
    if (activeTab === 'assets') {
      fetchAssets();
    }
    fetchCategories();
    fetchEmployees();
  }, [currentPage, searchTerm, sortBy, activeTab]);

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const statusMatch = filterStatus === "all" || asset.status === filterStatus;
    const categoryMatch = filterCategory === "all" || asset.category_name === filterCategory;
    return statusMatch && categoryMatch;
  });

  // Action handlers
  const handleViewAsset = async (assetId) => {
    try {
      setLoading(true);
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsset = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowEditModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleAssignAsset = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowAssignModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleViewActivities = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowActivitiesModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleCheckInAsset = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowCheckInModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleChangeStatus = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setShowStatusModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  // NEW: Handle employee asset actions
  const handleProvideClarification = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setEmployeeActionType('provide_clarification');
      setShowEmployeeActionModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleCancelAssignment = async (assetId) => {
    try {
      const asset = await assetService.getAsset(assetId);
      setSelectedAsset(asset);
      setEmployeeActionType('cancel_assignment');
      setShowEmployeeActionModal(true);
    } catch (err) {
      console.error("Failed to fetch asset details:", err);
      showNotification("Failed to load asset details", "error");
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm("Are you sure you want to delete this asset? This action cannot be undone.")) return;
    
    try {
      await assetService.deleteAsset(assetId);
      fetchAssets();
      showNotification("Asset deleted successfully");
    } catch (err) {
      console.error("Failed to delete asset:", err);
      showNotification("Failed to delete asset", "error");
    }
  };

  const handleExportAssets = async () => {
    try {
      const exportData = {
        asset_ids: selectedAssets,
        export_format: "excel",
        include_assignments: true,
        include_depreciation: true
      };
      
      const blob = await assetService.exportAssets(exportData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification("Assets exported successfully");
    } catch (err) {
      console.error("Failed to export assets:", err);
      showNotification("Failed to export assets", "error");
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AZN"
    }).format(amount);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <DashboardLayout>
      <div className={`min-h-screen`}>
        <div className="max-w-7xl  mx-auto px-4 py-6 ">
          {/* Notification */}
          {notification && (
            <NotificationToast
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}

          {/* Clean Header Section */}
          <div className={` rounded-lg p-6 mb-6  `}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary} mb-1`}>Asset Management</h1>
                <p className={`${textMuted} text-xs`}>
                  Manage and track your organization's assets with enhanced employee interaction features
                </p>
              </div>
              <div className="flex gap-2 mt-4 lg:mt-0">
                <button
                  onClick={() => setShowAddModal(true)}
                  className={`${btnPrimary} px-4 py-2 rounded-lg flex items-center text-xs font-medium hover:shadow-md transition-all duration-200`}
                >
                  <Plus size={14} className="mr-1" />
                  Add Asset
                </button>
                <button
                  onClick={() => setShowStatsModal(true)}
                  className={`${btnSecondary} px-4 py-2 rounded-lg flex items-center text-xs font-medium hover:shadow-md transition-all duration-200`}
                >
                  <BarChart3 size={14} className="mr-1" />
                  Stats
                </button>
                <button
                  onClick={handleExportAssets}
                  disabled={selectedAssets.length === 0}
                  className={`${btnSecondary} px-4 py-2 rounded-lg flex items-center text-xs font-medium disabled:opacity-50 hover:shadow-md transition-all duration-200`}
                >
                  <Download size={14} className="mr-1" />
                  Export ({selectedAssets.length})
                </button>
              </div>
            </div>
          </div>

          {/* Clean Tab Navigation */}
          <div className={`${bgCard} rounded-lg mb-6 border ${borderColor} ${shadowClass} overflow-hidden`}>
            <div className="flex">
              {[
                { 
                  id: 'assets', 
                  label: 'Assets', 
                  icon: <Package size={16} />, 
                  count: assetStats.total
                },
                { 
                  id: 'categories', 
                  label: 'Categories', 
                  icon: <Building size={16} />, 
                  count: categories.length
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-xs font-medium flex items-center justify-center transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-almet-sapphire border-b-2 border-almet-sapphire bg-almet-sapphire/5'
                      : `${textMuted} hover:text-almet-sapphire hover:bg-gray-50 dark:hover:bg-gray-700/50`
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-almet-sapphire text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'assets' ? (
            <>
              {/* Clean Filters Section */}
              <div className={`${bgCard} rounded-lg mb-6 border ${borderColor} ${shadowClass} p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                  {/* Compact Search */}
                  <div className="md:col-span-2 relative">
                    <Search size={14} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs`}
                    />
                  </div>

                  <SearchableDropdown
                    options={statusChoices}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="All Status"
                    darkMode={darkMode}
                    icon={<Target size={12} />}
                  />

                  <SearchableDropdown
                    options={categoryOptions}
                    value={filterCategory}
                    onChange={setFilterCategory}
                    placeholder="All Categories"
                    darkMode={darkMode}
                    icon={<Building size={12} />}
                  />

                  <SearchableDropdown
                    options={sortOptions}
                    value={sortBy}
                    onChange={setSortBy}
                    placeholder="Sort by"
                    darkMode={darkMode}
                    icon={<ArrowUpDown size={12} />}
                  />

                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                      setFilterCategory("all");
                      setSortBy("-created_at");
                    }}
                    className={`${btnSecondary} px-3 py-2 rounded-lg text-xs hover:shadow-md transition-all duration-200`}
                  >
                    <RefreshCw size={12} className="mr-1" />
                    Reset
                  </button>
                </div>

                {/* View Mode and Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`px-3 py-1 rounded text-xs transition-all duration-200 ${
                          viewMode === "grid"
                            ? "bg-almet-sapphire text-white"
                            : `${textMuted} hover:text-almet-sapphire`
                        }`}
                      >
                        <Grid3X3 size={12} className="inline mr-1" />
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-1 rounded text-xs transition-all duration-200 ${
                          viewMode === "table"
                            ? "bg-almet-sapphire text-white"
                            : `${textMuted} hover:text-almet-sapphire`
                        }`}
                      >
                        <List size={12} className="inline mr-1" />
                        Table
                      </button>
                    </div>
                  </div>
                  <div className={`${textMuted} text-xs`}>
                    {filteredAssets.length} of {totalCount} assets
                    {selectedAssets.length > 0 && (
                      <span className="ml-2 text-almet-sapphire">
                        ({selectedAssets.length} selected)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Assets Display */}
              <div className={`${bgCard} rounded-lg border ${borderColor} ${shadowClass} `}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-6 h-6 animate-spin text-almet-sapphire mr-2" />
                    <span className={`${textMuted} text-sm`}>Loading assets...</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                    <span className={`${textMuted} text-sm`}>{error}</span>
                    <button
                      onClick={fetchAssets}
                      className={`${btnPrimary} px-3 py-1.5 rounded text-xs mt-2 hover:shadow-md transition-all duration-200`}
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className={`${textPrimary} text-sm font-medium mb-1`}>No assets found</p>
                    <p className={`${textMuted} text-xs mb-4`}>
                      {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                        ? 'Try adjusting your search criteria'
                        : 'Get started by adding your first asset'
                      }
                    </p>
                    {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className={`${btnPrimary} px-4 py-2 rounded-lg text-xs hover:shadow-md transition-all duration-200`}
                      >
                        <Plus size={12} className="mr-1" />
                        Add Asset
                      </button>
                    )}
                  </div>
                ) : viewMode === "grid" ? (
                  /* Clean Grid View */
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className={`${bgAccent} rounded-lg border ${borderColor} p-4 hover:shadow-md transition-all duration-200 group`}
                        >
                          {/* Asset Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 pr-2">
                              <h3 className={`${textPrimary} font-medium text-sm mb-1 line-clamp-2`}>
                                {asset.asset_name}
                              </h3>
                              <p className={`${textMuted} text-xs font-mono`}>{asset.serial_number}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedAssets.includes(asset.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAssets([...selectedAssets, asset.id]);
                                } else {
                                  setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                                }
                              }}
                              className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire w-3 h-3"
                            />
                          </div>

                          {/* Status Badge */}
                          <div className="mb-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                              {getStatusIcon(asset.status)}
                              <span className="ml-1">{asset.status_display}</span>
                            </span>
                          </div>

                          {/* Asset Details */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`${textMuted}`}>Category:</span>
                              <span className={`${textSecondary} font-medium`}>{asset.category_name}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`${textMuted}`}>Value:</span>
                              <span className={`${textSecondary} font-medium`}>{formatCurrency(asset.purchase_price)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`${textMuted}`}>Date:</span>
                              <span className={`${textSecondary}`}>{formatDate(asset.purchase_date)}</span>
                            </div>
                            {asset.assigned_to_name && (
                              <div className="flex items-center justify-between text-xs">
                                <span className={`${textMuted}`}>Assigned:</span>
                                <span className={`${textSecondary} font-medium truncate ml-2`}>{asset.assigned_to_name}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleViewAsset(asset.id)}
                              className="flex-1 bg-almet-sapphire/10 hover:bg-almet-sapphire/20 text-almet-sapphire px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center"
                            >
                              <Eye size={12} className="mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditAsset(asset.id)}
                              className={`${btnSecondary} px-2 py-1.5 rounded text-xs transition-all duration-200`}
                            >
                              <Edit size={12} />
                            </button>
                            <div className="relative group">
                              <button className={`${btnSecondary} px-2 py-1.5 rounded text-xs`}>
                                <MoreHorizontal size={12} />
                              </button>
                              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-44">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleAssignAsset(asset.id)}
                                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                                  >
                                    <UserPlus size={10} className="mr-2 text-almet-sapphire" />
                                    Assign
                                  </button>
                                  <button
                                    onClick={() => handleViewActivities(asset.id)}
                                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                                  >
                                    <Activity size={10} className="mr-2 text-blue-500" />
                                    Activities
                                  </button>
                                  {asset.can_be_checked_in && (
                                    <button
                                      onClick={() => handleCheckInAsset(asset.id)}
                                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                      <LogOut size={10} className="mr-2 text-emerald-500" />
                                      Check In
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleChangeStatus(asset.id)}
                                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                                  >
                                    <RotateCcw size={10} className="mr-2 text-amber-500" />
                                    Change Status
                                  </button>
                                  {/* NEW: Employee Asset Actions */}
                                  {asset.status === 'NEED_CLARIFICATION'  && (
                                    <button
                                      onClick={() => handleProvideClarification(asset.id)}
                                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                      <Reply size={10} className="mr-2 text-purple-500" />
                                      Provide Clarification
                                    </button>
                                  )}
                                  {(asset.status === 'ASSIGNED' || asset.status === 'NEED_CLARIFICATION' || asset.status === 'IN_USE')  && (
                                    <button
                                      onClick={() => handleCancelAssignment(asset.id)}
                                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors flex items-center"
                                    >
                                      <Ban size={10} className="mr-2" />
                                      Cancel Assignment
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteAsset(asset.id)}
                                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors flex items-center"
                                  >
                                    <Trash2 size={10} className="mr-2" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Clean Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${bgAccent} border-b ${borderColor}`}>
                        <tr>
                          <th className="px-4 py-3 text-left w-8">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAssets(filteredAssets.map(asset => asset.id));
                                } else {
                                  setSelectedAssets([]);
                                }
                              }}
                              checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                              className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire w-3 h-3"
                            />
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase`}>
                            Asset
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase`}>
                            Category
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase`}>
                            Status
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase`}>
                            Assigned To
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase`}>
                            Value
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAssets.map((asset) => (
                          <tr key={asset.id} className={`hover:${bgAccent} transition-colors`}>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedAssets.includes(asset.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAssets([...selectedAssets, asset.id]);
                                  } else {
                                    setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire w-3 h-3"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className={`${textPrimary} font-medium text-sm`}>{asset.asset_name}</p>
                                <p className={`${textMuted} text-xs font-mono`}>{asset.serial_number}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
                                <Building size={10} className="mr-1" />
                                {asset.category_name}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                                {getStatusIcon(asset.status)}
                                <span className="ml-1">{asset.status_display}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {asset.assigned_to_name ? (
                                <div>
                                  <p className={`${textPrimary} text-sm font-medium`}>{asset.assigned_to_name}</p>
                                  <p className={`${textMuted} text-xs`}>ID: {asset.assigned_to_employee_id}</p>
                                </div>
                              ) : (
                                <span className={`${textMuted} text-sm`}>Unassigned</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className={`${textPrimary} font-medium text-sm`}>
                                  {formatCurrency(asset.purchase_price)}
                                </p>
                                <p className={`${textMuted} text-xs`}>
                                  {formatDate(asset.purchase_date)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleViewAsset(asset.id)}
                                  className="p-1.5 rounded hover:bg-almet-sapphire/10 text-almet-sapphire transition-colors"
                                  title="View"
                                >
                                  <Eye size={12} />
                                </button>
                                <button
                                  onClick={() => handleEditAsset(asset.id)}
                                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={12} className={`${textMuted}`} />
                                </button>
                                <button
                                  onClick={() => handleAssignAsset(asset.id)}
                                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  title="Assign"
                                >
                                  <UserPlus size={12} className={`${textMuted}`} />
                                </button>
                                <button
                                  onClick={() => handleViewActivities(asset.id)}
                                  className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                                  title="Activities"
                                >
                                  <Activity size={12} className="text-blue-500" />
                                </button>
                                {asset.can_be_checked_in && (
                                  <button
                                    onClick={() => handleCheckInAsset(asset.id)}
                                    className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors"
                                    title="Check In"
                                  >
                                    <LogOut size={12} className="text-emerald-500" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleChangeStatus(asset.id)}
                                  className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
                                  title="Change Status"
                                >
                                  <RotateCcw size={12} className="text-amber-500" />
                                </button>
                                {/* NEW: Employee Asset Actions in Table */}
                                {asset.status === 'NEED_CLARIFICATION'  && (
                                  <button
                                    onClick={() => handleProvideClarification(asset.id)}
                                    className="p-1.5 rounded hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                                    title="Provide Clarification"
                                  >
                                    <Reply size={12} className="text-purple-500" />
                                  </button>
                                )}
                                {(asset.status == 'ASSIGNED' || asset.status == 'NEED_CLARIFICATION' || asset.status == 'IN_USE' )  && (
                                  <button
                                    onClick={() => handleCancelAssignment(asset.id)}
                                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                    title="Cancel Assignment"
                                  >
                                    <Ban size={12} className="text-red-500" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteAsset(asset.id)}
                                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={12} className="text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Clean Pagination */}
                {totalPages > 1 && (
                  <div className={`px-4 py-3 border-t ${borderColor} ${bgAccent}`}>
                    <div className="flex items-center justify-between">
                      <div className={`${textMuted} text-xs`}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`${btnSecondary} px-3 py-1.5 rounded text-xs disabled:opacity-50 flex items-center hover:shadow-md transition-all duration-200`}
                        >
                          <ChevronLeft size={12} className="mr-1" />
                          Prev
                        </button>
                        
                        <div className="flex space-x-1">
                          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage <= 2) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 1) {
                              pageNum = totalPages - 2 + i;
                            } else {
                              pageNum = currentPage - 1 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1.5 rounded text-xs transition-all duration-200 ${
                                  currentPage === pageNum
                                    ? 'bg-almet-sapphire text-white'
                                    : `${btnSecondary} hover:shadow-md`
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`${btnSecondary} px-3 py-1.5 rounded text-xs disabled:opacity-50 flex items-center hover:shadow-md transition-all duration-200`}
                        >
                          Next
                          <ChevronRight size={12} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Categories Tab */
            <CategoryManagement darkMode={darkMode} />
          )}

          {/* All Modals */}
          {showViewModal && selectedAsset && (
            <AssetDetailsModal
              asset={selectedAsset}
              onClose={() => setShowViewModal(false)}
              darkMode={darkMode}
              onEdit={() => {
                setShowViewModal(false);
                setShowEditModal(true);
              }}
              onCheckIn={(updatedAsset) => {
                setShowViewModal(false);
                fetchAssets();
                showNotification("Asset checked in successfully");
              }}
              onChangeStatus={(updatedAsset) => {
                setShowViewModal(false);
                fetchAssets();
                showNotification("Asset status changed successfully");
              }}
            />
          )}

          {showAddModal && (
            <AddAssetModal
              onClose={() => setShowAddModal(false)}
              onSuccess={() => {
                setShowAddModal(false);
                fetchAssets();
                showNotification("Asset added successfully");
              }}
              categories={categories}
              darkMode={darkMode}
            />
          )}

          {showEditModal && selectedAsset && (
            <EditAssetModal
              asset={selectedAsset}
              onClose={() => setShowEditModal(false)}
              onSuccess={() => {
                setShowEditModal(false);
                fetchAssets();
                showNotification("Asset updated successfully");
              }}
              categories={categories}
              darkMode={darkMode}
            />
          )}

          {showAssignModal && selectedAsset && (
            <AssignAssetModal
              asset={selectedAsset}
              onClose={() => setShowAssignModal(false)}
              onSuccess={() => {
                setShowAssignModal(false);
                fetchAssets();
                showNotification("Asset assigned successfully");
              }}
              darkMode={darkMode}
            />
          )}

          {showActivitiesModal && selectedAsset && (
            <AssetActivitiesModal
              asset={selectedAsset}
              onClose={() => setShowActivitiesModal(false)}
              darkMode={darkMode}
            />
          )}

          {showStatsModal && (
            <AssetStatsModal
              onClose={() => setShowStatsModal(false)}
              darkMode={darkMode}
              assetStats={assetStats}
            />
          )}

          {showCheckInModal && selectedAsset && (
            <CheckInAssetModal
              asset={selectedAsset}
              onClose={() => setShowCheckInModal(false)}
              onSuccess={() => {
                setShowCheckInModal(false);
                fetchAssets();
                showNotification("Asset checked in successfully");
              }}
              darkMode={darkMode}
            />
          )}

          {showStatusModal && selectedAsset && (
            <ChangeStatusModal
              asset={selectedAsset}
              onClose={() => setShowStatusModal(false)}
              onSuccess={() => {
                setShowStatusModal(false);
                fetchAssets();
                showNotification("Asset status changed successfully");
              }}
              darkMode={darkMode}
            />
          )}

          {/* NEW: Employee Asset Action Modal */}
          {showEmployeeActionModal && selectedAsset && (
            <EmployeeAssetActionModal
              asset={selectedAsset}
              employeeId={selectedAsset.assigned_to?.id}
              onClose={() => setShowEmployeeActionModal(false)}
              onSuccess={() => {
                setShowEmployeeActionModal(false);
                fetchAssets();
                const actionMessage = employeeActionType === 'provide_clarification' 
                  ? "Clarification provided successfully" 
                  : "Assignment cancelled successfully";
                showNotification(actionMessage);
              }}
              darkMode={darkMode}
              actionType={employeeActionType}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetManagementPage;