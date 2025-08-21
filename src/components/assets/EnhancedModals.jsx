// src/components/assets/EnhancedModals.jsx - All missing modals including Stats and Assignment
"use client";
import { useState, useEffect, useRef } from "react";
import { 
  XCircle, 
  Plus, 
  UserPlus,
  Loader, 
  ChevronDown,
  Search,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  Wrench,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { assetService, employeeService } from "@/services/assetService";

// Searchable Dropdown Component
const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  searchPlaceholder = "Search...",
  className = "",
  darkMode = false,
  disabled = false
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm text-left flex items-center justify-between transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={selectedOption ? textPrimary : textMuted}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className={`absolute z-50 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-xl max-h-60 overflow-hidden`}>
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border ${borderColor} rounded focus:ring-1 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm`}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className={`px-3 py-2 ${textMuted} text-sm`}>
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
                  className={`w-full px-3 py-2 text-left ${hoverBg} ${textPrimary} text-sm transition-colors duration-150 ${
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

// Asset Statistics Modal
export const AssetStatsModal = ({ onClose, darkMode, assetStats }) => {
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/30";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AZN"
    }).format(amount);
  };

  const getStatusPercentage = (count) => {
    return assetStats.total > 0 ? Math.round((count / assetStats.total) * 100) : 0;
  };

  const StatsCard = ({ icon, title, value, subtitle, color, percentage }) => (
    <div className={`${bgAccent} rounded-lg p-6 border ${borderColor} hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        {percentage !== undefined && (
          <span className={`text-xs ${textMuted} font-medium`}>{percentage}%</span>
        )}
      </div>
      <h3 className={`${textPrimary} text-2xl font-bold mb-1`}>{value}</h3>
      <p className={`${textMuted} text-sm font-medium`}>{title}</p>
      {subtitle && (
        <p className={`${textMuted} text-xs mt-1`}>{subtitle}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border ${borderColor}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`${textPrimary} text-2xl font-bold mb-2 flex items-center`}>
                <BarChart3 size={24} className="mr-3 text-almet-sapphire" />
                Asset Statistics
              </h2>
              <p className={`${textMuted} text-sm`}>
                Comprehensive overview of your asset portfolio
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={24} />
            </button>
          </div>
          
          {/* Main Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon={<Package className="text-white" size={20} />}
              title="Total Assets"
              value={assetStats.total}
              subtitle="All assets in system"
              color="bg-almet-sapphire"
            />
            <StatsCard
              icon={<DollarSign className="text-white" size={20} />}
              title="Total Value"
              value={formatCurrency(assetStats.totalValue)}
              subtitle="Combined asset value"
              color="bg-emerald-500"
            />
            <StatsCard
              icon={<Users className="text-white" size={20} />}
              title="Assets in Use"
              value={assetStats.inUse}
              subtitle="Currently deployed"
              color="bg-green-500"
              percentage={getStatusPercentage(assetStats.inUse)}
            />
            <StatsCard
              icon={<TrendingUp className="text-white" size={20} />}
              title="Utilization Rate"
              value={`${getStatusPercentage(assetStats.inUse + assetStats.assigned)}%`}
              subtitle="Assets in use + assigned"
              color="bg-blue-500"
            />
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className={`${bgAccent} rounded-lg p-6 border ${borderColor}`}>
              <h3 className={`${textPrimary} font-semibold mb-4 text-lg flex items-center`}>
                <PieChart size={18} className="mr-2 text-almet-sapphire" />
                Status Distribution
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'In Stock', value: assetStats.inStock, icon: Package, color: 'text-blue-500' },
                  { label: 'In Use', value: assetStats.inUse, icon: CheckCircle, color: 'text-emerald-500' },
                  { label: 'Assigned', value: assetStats.assigned, icon: Clock, color: 'text-amber-500' },
                  { label: 'Need Clarification', value: assetStats.needClarification, icon: AlertCircle, color: 'text-purple-500' },
                  { label: 'In Repair', value: assetStats.inRepair, icon: Wrench, color: 'text-orange-500' },
                  { label: 'Archived', value: assetStats.archived, icon: Archive, color: 'text-gray-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center">
                      <item.icon size={16} className={`mr-3 ${item.color}`} />
                      <span className={`${textSecondary} text-sm font-medium`}>{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`${textPrimary} font-semibold`}>{item.value}</span>
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}
                          style={{ width: `${getStatusPercentage(item.value)}%` }}
                        ></div>
                      </div>
                      <span className={`${textMuted} text-xs font-medium w-8 text-right`}>
                        {getStatusPercentage(item.value)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className={`${bgAccent} rounded-lg p-6 border ${borderColor}`}>
              <h3 className={`${textPrimary} font-semibold mb-4 text-lg flex items-center`}>
                <Activity size={18} className="mr-2 text-almet-sapphire" />
                Key Metrics
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`${textSecondary} text-sm font-medium`}>Available Assets</span>
                    <span className={`${textPrimary} text-lg font-bold`}>{assetStats.inStock}</span>
                  </div>
                  <p className={`${textMuted} text-xs`}>Ready for deployment</p>
                </div>
                
                <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`${textSecondary} text-sm font-medium`}>Pending Actions</span>
                    <span className={`${textPrimary} text-lg font-bold`}>{assetStats.assigned + assetStats.needClarification}</span>
                  </div>
                  <p className={`${textMuted} text-xs`}>Require attention</p>
                </div>
                
                <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`${textSecondary} text-sm font-medium`}>Average Asset Value</span>
                    <span className={`${textPrimary} text-lg font-bold`}>
                      {assetStats.total > 0 ? formatCurrency(assetStats.totalValue / assetStats.total) : formatCurrency(0)}
                    </span>
                  </div>
                  <p className={`${textMuted} text-xs`}>Per asset</p>
                </div>
                
                <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`${textSecondary} text-sm font-medium`}>Deployment Rate</span>
                    <span className={`${textPrimary} text-lg font-bold`}>
                      {getStatusPercentage(assetStats.inUse + assetStats.assigned)}%
                    </span>
                  </div>
                  <p className={`${textMuted} text-xs`}>Assets in circulation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className={`${btnSecondary} px-6 py-2.5 rounded-lg text-sm hover:shadow-md transition-all duration-200`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assign Asset Modal
export const AssignAssetModal = ({ asset, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    employee: '',
    check_out_date: new Date().toISOString().split('T')[0],
    check_out_notes: '',
    condition_on_checkout: 'EXCELLENT'
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState('');

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/30";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  const conditionOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' }
  ];

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeeService.getEmployees();
        setEmployees(response.results || []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setError('Failed to load employees');
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const employeeOptions = employees.map(employee => ({
    value: employee.id,
    label: `${employee.name || employee.full_name} (${employee.employee_id})`
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const assignmentData = {
        asset: asset.id,
        employee: formData.employee,
        check_out_date: formData.check_out_date,
        check_out_notes: formData.check_out_notes,
        condition_on_checkout: formData.condition_on_checkout
      };
      
      const result = await assetService.assignAsset(asset.id, assignmentData);
      onSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign asset');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>Assign Asset</h2>
            <button
              type="button"
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={20} />
            </button>
          </div>

          {/* Asset Info */}
          <div className={`${bgAccent} rounded-lg p-4 mb-6 border ${borderColor}`}>
            <h3 className={`${textPrimary} font-semibold mb-2`}>Asset Details</h3>
            <p className={`${textPrimary} text-sm`}>{asset.asset_name}</p>
            <p className={`${textMuted} text-xs`}>Serial: {asset.serial_number}</p>
            <p className={`${textMuted} text-xs`}>Category: {asset.category?.name}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Employee *
              </label>
              {employeesLoading ? (
                <div className="flex items-center justify-center p-3 border border-gray-300 rounded-lg">
                  <Loader size={16} className="animate-spin mr-2" />
                  <span className={`${textMuted} text-sm`}>Loading employees...</span>
                </div>
              ) : (
                <SearchableDropdown
                  options={employeeOptions}
                  value={formData.employee}
                  onChange={(value) => setFormData(prev => ({ ...prev, employee: value }))}
                  placeholder="Select employee"
                  searchPlaceholder="Search employees..."
                  darkMode={darkMode}
                />
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Assignment Date *
              </label>
              <input
                type="date"
                name="check_out_date"
                value={formData.check_out_date}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Condition on Assignment *
              </label>
              <SearchableDropdown
                options={conditionOptions}
                value={formData.condition_on_checkout}
                onChange={(value) => setFormData(prev => ({ ...prev, condition_on_checkout: value }))}
                placeholder="Select condition"
                searchPlaceholder="Search conditions..."
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Assignment Notes
              </label>
              <textarea
                name="check_out_notes"
                value={formData.check_out_notes}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm`}
                rows="3"
                placeholder="Add any notes about the assignment..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`${btnSecondary} px-6 py-2.5 rounded-lg text-sm hover:shadow-md transition-all duration-200`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.employee}
              className={`${btnPrimary} px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 flex items-center hover:shadow-md transition-all duration-200`}
            >
              {loading ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus size={16} className="mr-2" />
                  Assign Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Asset Activities Modal
export const AssetActivitiesModal = ({ asset, onClose, darkMode }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/30";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await assetService.getAssetActivities(asset.id);
        setActivities(response.activities || []);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [asset.id]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getActivityIcon = (activityType) => {
    const iconProps = { size: 16 };
    switch (activityType) {
      case 'CREATED': return <Plus {...iconProps} className="text-blue-500" />;
      case 'ASSIGNED': return <UserPlus {...iconProps} className="text-green-500" />;
      case 'CHECKED_IN': return <CheckCircle {...iconProps} className="text-emerald-500" />;
      case 'STATUS_CHANGED': return <Activity {...iconProps} className="text-amber-500" />;
      default: return <Activity {...iconProps} className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border ${borderColor}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`${textPrimary} text-xl font-bold mb-2`}>Asset Activity History</h2>
              <p className={`${textMuted} text-sm`}>{asset.asset_name} - {asset.serial_number}</p>
            </div>
            <button
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={24} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-almet-sapphire mr-3" />
              <span className={`${textMuted}`}>Loading activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className={`${textMuted} text-lg font-medium`}>No activities found</p>
              <p className={`${textMuted} text-sm`}>No activity history available for this asset</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className={`${bgAccent} rounded-lg p-4 border ${borderColor} hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-almet-sapphire/10 rounded-lg flex items-center justify-center mr-3">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`${textPrimary} font-medium text-sm`}>{activity.activity_type.replace('_', ' ')}</h4>
                        <span className={`${textMuted} text-xs`}>{formatDateTime(activity.performed_at)}</span>
                      </div>
                      <p className={`${textSecondary} text-sm mb-2`}>{activity.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`${textMuted} text-xs`}>
                          By {activity.performed_by_detail?.first_name} {activity.performed_by_detail?.last_name}
                        </span>
                        {activity.metadata && (
                          <div className="flex space-x-2">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span key={key} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className={`${btnSecondary} px-6 py-2.5 rounded-lg text-sm hover:shadow-md transition-all duration-200`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};