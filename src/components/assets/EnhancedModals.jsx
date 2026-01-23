// src/components/assets/EnhancedModals.jsx - Fixed modals with corrected assignment API
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
  Activity,
  X
} from "lucide-react";
import { assetService, employeeService } from "@/services/assetService";
import SearchableDropdown from "../common/SearchableDropdown";
// Asset Statistics Modal
export const AssetStatsModal = ({ onClose, darkMode, assetStats }) => {
  const bgCard = darkMode ? "bg-almet-comet" : "bg-white";
  const textPrimary = darkMode ? "text-almet-mystic" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-san-juan/30" : "border-almet-mystic";
  const bgAccent = darkMode ? "bg-almet-san-juan/20" : "bg-almet-mystic/50";
  const btnClose = darkMode ? "hover:bg-almet-san-juan/30" : "hover:bg-almet-mystic";

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
    <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        {percentage !== undefined && (
          <span className={`text-xs ${textMuted} font-medium`}>
            {percentage}%
          </span>
        )}
      </div>
      <h3 className={`${textPrimary} text-lg font-semibold mb-1`}>{value}</h3>
      <p className={`${textSecondary} text-xs font-medium`}>{title}</p>
      {subtitle && (
        <p className={`${textMuted} text-xs mt-1`}>{subtitle}</p>
      )}
    </div>
  );

  const StatusItem = ({ label, value, icon: Icon, color, barColor }) => (
    <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-almet-comet/30 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className={`w-6 h-6 ${color} rounded flex items-center justify-center`}>
          <Icon size={14} className="text-white" />
        </div>
        <span className={`${textSecondary} text-xs font-medium`}>{label}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`${textPrimary} text-sm font-semibold min-w-[1.5rem] text-right`}>{value}</span>
        <div className="w-16 bg-almet-mystic/40 dark:bg-almet-san-juan/40 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${barColor}`}
            style={{ width: `${getStatusPercentage(value)}%` }}
          ></div>
        </div>
        <span className={`${textMuted} text-xs font-medium w-8 text-right`}>
          {getStatusPercentage(value)}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg border ${borderColor}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className={`${textPrimary} text-xl font-semibold flex items-center`}>
                <BarChart3 size={20} className="mr-3 text-almet-sapphire" />
                Asset Statistics
              </h2>
              <p className={`${textMuted} text-xs mt-1`}>
                Comprehensive overview of your asset portfolio
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} ${btnClose} transition-colors p-2 rounded-lg`}
            >
              <XCircle size={20} />
            </button>
          </div>
          
          {/* Main Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={<Package className="text-white" size={16} />}
              title="Total Assets"
              value={assetStats.total.toLocaleString()}
              subtitle="All assets in system"
              color="bg-almet-sapphire"
            />
            <StatsCard
              icon={<DollarSign className="text-white" size={16} />}
              title="Total Value"
              value={formatCurrency(assetStats.totalValue)}
              subtitle="Combined asset value"
              color="bg-emerald-500"
            />
            <StatsCard
              icon={<Users className="text-white" size={16} />}
              title="Assets in Use"
              value={assetStats.inUse.toLocaleString()}
              subtitle="Currently deployed"
              color="bg-green-500"
              percentage={getStatusPercentage(assetStats.inUse)}
            />
            <StatsCard
              icon={<TrendingUp className="text-white" size={16} />}
              title="Utilization Rate"
              value={`${getStatusPercentage(assetStats.inUse + assetStats.assigned)}%`}
              subtitle="Assets in use + assigned"
              color="bg-almet-steel-blue"
            />
          </div>

          {/* Status Distribution */}
          <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
            <h3 className={`${textPrimary} font-semibold mb-4 text-base flex items-center`}>
              <PieChart size={16} className="mr-2 text-almet-sapphire" />
              Status Distribution
            </h3>
            <div className="space-y-2">
              <StatusItem
                label="In Stock"
                value={assetStats.inStock}
                icon={Package}
                color="bg-almet-sapphire"
                barColor="bg-almet-sapphire"
              />
              <StatusItem
                label="In Use"
                value={assetStats.inUse}
                icon={CheckCircle}
                color="bg-emerald-500"
                barColor="bg-emerald-500"
              />
              <StatusItem
                label="Assigned"
                value={assetStats.assigned}
                icon={Clock}
                color="bg-amber-500"
                barColor="bg-amber-500"
              />
              <StatusItem
                label="Need Clarification"
                value={assetStats.needClarification}
                icon={AlertCircle}
                color="bg-purple-500"
                barColor="bg-purple-500"
              />
              <StatusItem
                label="In Repair"
                value={assetStats.inRepair}
                icon={Wrench}
                color="bg-orange-500"
                barColor="bg-orange-500"
              />
              <StatusItem
                label="Archived"
                value={assetStats.archived}
                icon={Archive}
                color="bg-gray-500"
                barColor="bg-gray-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Assign Asset Modal with Fixed API Call
export const AssignAssetModal = ({ asset, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    employee: '',
    check_out_date: new Date().toISOString().split('T')[0],
    check_out_notes: '',
    condition_on_checkout: 'EXCELLENT',
    asset:""
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState('');

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
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
        const response = await employeeService.getEmployees({ page_size: 100 });
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
      // 🎯 FIXED: Düzgün payload strukturu
      const assignmentData = {
        asset: asset.id, // asset ID-ni əlavə et
        employee: parseInt(formData.employee), // integer olaraq göndər
        check_out_date: formData.check_out_date,
        check_out_notes: formData.check_out_notes,
        condition_on_checkout: formData.condition_on_checkout
      };
      
      console.log('✅ Assignment payload:', assignmentData);
      
      // assignToEmployee metodunu çağır
      const result = await assetService.assignToEmployee(assignmentData);
      
      console.log('✅ Assignment successful:', result);
      onSuccess(result);
    } catch (err) {
      console.error('❌ Assignment error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to assign asset';
      setError(errorMessage);
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
            <p className={`${textPrimary} text-sm font-medium`}>{asset.asset_name}</p>
            <p className={`${textMuted} text-xs`}>Serial: {asset.serial_number}</p>
            <p className={`${textMuted} text-xs`}>Category: {asset.category?.name || asset.category_name}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <div className="flex items-start">
                <AlertCircle size={16} className="mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Assignment Failed</p>
                  <p>{error}</p>
                </div>
              </div>
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
                       allowUncheck={true}
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
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm`}
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
                     allowUncheck={true}
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
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm`}
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
              disabled={loading || !formData.employee || employeesLoading}
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

  const bgCard = darkMode ? "bg-almet-comet" : "bg-white";
  const textPrimary = darkMode ? "text-almet-mystic" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-san-juan/30" : "border-almet-mystic";
  const bgAccent = darkMode ? "bg-almet-san-juan/20" : "bg-almet-mystic/50";
  const btnClose = darkMode ? "hover:bg-almet-san-juan/30" : "hover:bg-almet-mystic";

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
    const iconProps = { size: 14 };
    switch (activityType) {
      case 'CREATED': return <Plus {...iconProps} className="text-almet-sapphire" />;
      case 'ASSIGNED': return <UserPlus {...iconProps} className="text-green-500" />;
      case 'CHECKED_IN': return <CheckCircle {...iconProps} className="text-emerald-500" />;
      case 'STATUS_CHANGED': return <Activity {...iconProps} className="text-amber-500" />;
      case 'ASSIGNMENT_CANCELLED': return <X {...iconProps} className="text-red-500" />;
      default: return <Activity {...iconProps} className="text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (activityType) => {
    switch (activityType) {
      case 'ASSIGNMENT_CANCELLED': return 'Assignment Cancelled';
      case 'ASSIGNED': return 'Assigned';
      case 'CREATED': return 'Created';
      case 'CHECKED_IN': return 'Checked In';
      case 'STATUS_CHANGED': return 'Status Changed';
      default: return activityType.replace('_', ' ');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-lg border ${borderColor} flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-almet-mystic/50 dark:border-almet-san-juan/30">
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`${textPrimary} text-lg font-semibold mb-1`}>Asset Activity History</h2>
              <p className={`${textMuted} text-xs`}>
                {asset.asset_name} - {asset.serial_number}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} ${btnClose} transition-colors p-2 rounded-lg`}
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-almet-sapphire mr-2" />
              <span className={`${textMuted} text-sm`}>Loading activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className={`${textMuted} text-sm font-medium`}>No activities found</p>
              <p className={`${textMuted} text-xs mt-1`}>No activity history available for this asset</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-6 h-6 bg-white/20 dark:bg-black/20 rounded flex items-center justify-center mt-0.5">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`${textPrimary} font-medium text-sm`}>
                          {getActivityTypeLabel(activity.activity_type)}
                        </h4>
                        <span className={`${textMuted} text-xs flex-shrink-0 ml-2`}>
                          {formatDateTime(activity.performed_at)}
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className={`${textSecondary} text-xs mb-3 break-words`}>
                        {activity.description}
                      </p>
                      
                      {/* Footer */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`${textMuted} text-xs`}>
                            By {activity.performed_by_detail?.first_name} {activity.performed_by_detail?.last_name}
                          </span>
                        </div>
                        
                        {/* Metadata */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="grid grid-cols-1 gap-1">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between py-1 px-2 bg-white/30 dark:bg-black/20 rounded text-xs">
                                <span className={`${textMuted} font-medium capitalize`}>
                                  {key.replace('_', ' ')}:
                                </span>
                                <span className={`${textSecondary} ml-2 break-all`}>
                                  {String(value)}
                                </span>
                              </div>
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
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-almet-mystic/50 dark:border-almet-san-juan/30">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`${textSecondary} hover:${textPrimary} px-4 py-2 rounded-lg text-sm ${btnClose} transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};