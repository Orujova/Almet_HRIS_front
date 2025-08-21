// src/components/headcount/EmployeeAssetManagement.jsx - Enhanced with provide clarification and cancel assignment
"use client";
import { useState, useEffect } from "react";
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  Calendar,
  DollarSign,
  Building,
  Tag,
  Activity,
  User,
  Loader,
  RefreshCw,
  Eye,
  MoreHorizontal,
  FileText,
  AlertCircle,
  Settings,
  ArrowLeft,
  CheckSquare,
  Edit,
  LogOut,
  Ban,
  Reply
} from "lucide-react";
import { employeeAssetService } from "@/services/assetService";

const EmployeeAssetManagement = ({ employeeId, employeeData, darkMode }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({
    comments: '',
    clarification_reason: '',
    clarification_response: '',
    cancellation_reason: ''
  });

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";
  const btnSuccess = "bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200";
  const btnWarning = "bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200";
  const btnDanger = "bg-red-500 hover:bg-red-600 text-white transition-all duration-200";
  const shadowClass = darkMode ? "" : "shadow-sm";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/30";

  // Extract assets from employee data
  useEffect(() => {
    if (employeeData) {
      setAssets(employeeData.assigned_assets || []);
    }
  }, [employeeData]);

  // Enhanced status color mapping with soft colors
  const getStatusColor = (status) => {
    const statusColors = {
      'IN_USE': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50',
      'ASSIGNED': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50',
      'NEED_CLARIFICATION': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50',
      'IN_STOCK': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50',
    };
    return statusColors[status] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700/50';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN_USE':
        return <CheckCircle size={12} />;
      case 'ASSIGNED':
        return <Clock size={12} />;
      case 'NEED_CLARIFICATION':
        return <AlertTriangle size={12} />;
      case 'IN_STOCK':
        return <Package size={12} />;
      default:
        return <Package size={12} />;
    }
  };

  // Handle asset actions
  const handleAcceptAsset = async (asset) => {
    setActionLoading(prev => ({ ...prev, [asset.id]: true }));
    try {
      await employeeAssetService.acceptAsset(employeeId, {
        asset_id: asset.id,
        comments: actionData.comments || 'Asset accepted by employee'
      });
      
      await refreshEmployeeData();
      setShowActionModal(false);
      resetActionData();
    } catch (error) {
      console.error('Failed to accept asset:', error);
      alert('Failed to accept asset. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  const handleRequestClarification = async (asset) => {
    setActionLoading(prev => ({ ...prev, [asset.id]: true }));
    try {
      await employeeAssetService.requestClarification(employeeId, {
        asset_id: asset.id,
        clarification_reason: actionData.clarification_reason
      });
      
      await refreshEmployeeData();
      setShowActionModal(false);
      resetActionData();
    } catch (error) {
      console.error('Failed to request clarification:', error);
      alert('Failed to request clarification. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  const handleProvideClarification = async (asset) => {
    setActionLoading(prev => ({ ...prev, [asset.id]: true }));
    try {
      await employeeAssetService.provideClarification(employeeId, {
        asset_id: asset.id,
        clarification_response: actionData.clarification_response
      });
      
      await refreshEmployeeData();
      setShowActionModal(false);
      resetActionData();
    } catch (error) {
      console.error('Failed to provide clarification:', error);
      alert('Failed to provide clarification. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  const handleCancelAssignment = async (asset) => {
    setActionLoading(prev => ({ ...prev, [asset.id]: true }));
    try {
      await employeeAssetService.cancelAssignment(employeeId, {
        asset_id: asset.id,
        cancellation_reason: actionData.cancellation_reason
      });
      
      await refreshEmployeeData();
      setShowActionModal(false);
      resetActionData();
    } catch (error) {
      console.error('Failed to cancel assignment:', error);
      alert('Failed to cancel assignment. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  const refreshEmployeeData = async () => {
    try {
      const updatedEmployee = await employeeAssetService.getEmployee(employeeId);
      setAssets(updatedEmployee.assigned_assets || []);
    } catch (error) {
      console.error('Failed to refresh employee data:', error);
    }
  };

  const resetActionData = () => {
    setActionData({
      comments: '',
      clarification_reason: '',
      clarification_response: '',
      cancellation_reason: ''
    });
  };

  const openActionModal = (asset, type) => {
    setSelectedAsset(asset);
    setActionType(type);
    setShowActionModal(true);
    resetActionData();
  };

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

  const assetsSummary = employeeData?.assets_summary || {
    total_assigned: 0,
    pending_approval: 0,
    in_use: 0,
    need_clarification: 0,
    has_pending_approvals: false
  };

  return (
    <div className="space-y-6">
      {/* Assets Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${bgAccent} rounded-lg p-4 text-center border ${borderColor} hover:shadow-md transition-all duration-200`}>
          <div className="flex items-center justify-center mb-2">
            <Package className="text-almet-sapphire" size={20} />
          </div>
          <p className={`${textPrimary} font-semibold text-lg`}>{assetsSummary.total_assigned}</p>
          <p className={`${textMuted} text-xs`}>Total Assigned</p>
        </div>
        <div className={`${bgAccent} rounded-lg p-4 text-center border ${borderColor} hover:shadow-md transition-all duration-200`}>
          <div className="flex items-center justify-center mb-2">
            <Clock className="text-amber-500" size={20} />
          </div>
          <p className={`${textPrimary} font-semibold text-lg`}>{assetsSummary.pending_approval}</p>
          <p className={`${textMuted} text-xs`}>Pending Approval</p>
        </div>
        <div className={`${bgAccent} rounded-lg p-4 text-center border ${borderColor} hover:shadow-md transition-all duration-200`}>
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="text-emerald-500" size={20} />
          </div>
          <p className={`${textPrimary} font-semibold text-lg`}>{assetsSummary.in_use}</p>
          <p className={`${textMuted} text-xs`}>In Use</p>
        </div>
        <div className={`${bgAccent} rounded-lg p-4 text-center border ${borderColor} hover:shadow-md transition-all duration-200`}>
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="text-purple-500" size={20} />
          </div>
          <p className={`${textPrimary} font-semibold text-lg`}>{assetsSummary.need_clarification}</p>
          <p className={`${textMuted} text-xs`}>Need Clarification</p>
        </div>
      </div>

      {/* Actions Header */}
      <div className="flex justify-between items-center">
        <h3 className={`${textPrimary} text-lg font-semibold`}>
          Assigned Assets ({assets.length})
        </h3>
        <button
          onClick={refreshEmployeeData}
          className={`${btnSecondary} px-3 py-2 rounded-lg flex items-center text-sm hover:shadow-md transition-all duration-200`}
        >
          <RefreshCw size={14} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Assets List */}
      {assets.length === 0 ? (
        <div className={`${bgAccent} rounded-lg p-8 text-center border ${borderColor}`}>
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className={`${textMuted} text-lg font-medium`}>No assets assigned</p>
          <p className={`${textMuted} text-sm`}>This employee has no assets assigned to them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assets.map((asset) => (
            <div key={asset.id} className={`${bgCard} rounded-lg border ${borderColor} p-6 ${shadowClass} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className={`${textPrimary} font-semibold text-lg`}>{asset.asset_name}</h4>
                      <p className={`${textMuted} text-sm`}>Serial: {asset.serial_number}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(asset.status)}`}>
                      {getStatusIcon(asset.status)}
                      <span className="ml-2">{asset.status_display}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className={`${textMuted} text-xs uppercase tracking-wide`}>Category</p>
                      <div className="flex items-center mt-1">
                        <Building size={14} className={`${textMuted} mr-2`} />
                        <span className={`${textSecondary} text-sm font-medium`}>{asset.category}</span>
                      </div>
                    </div>
                    <div>
                      <p className={`${textMuted} text-xs uppercase tracking-wide`}>Purchase Date</p>
                      <div className="flex items-center mt-1">
                        <Calendar size={14} className={`${textMuted} mr-2`} />
                        <span className={`${textSecondary} text-sm`}>{formatDate(asset.purchase_date)}</span>
                      </div>
                    </div>
                    <div>
                      <p className={`${textMuted} text-xs uppercase tracking-wide`}>Assignment Date</p>
                      <div className="flex items-center mt-1">
                        <Calendar size={14} className={`${textMuted} mr-2`} />
                        <span className={`${textSecondary} text-sm`}>{formatDate(asset.assignment_date)}</span>
                      </div>
                    </div>
                    <div>
                      <p className={`${textMuted} text-xs uppercase tracking-wide`}>Days Assigned</p>
                      <div className="flex items-center mt-1">
                        <Clock size={14} className={`${textMuted} mr-2`} />
                        <span className={`${textSecondary} text-sm font-medium`}>{asset.days_assigned} days</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {asset.status === 'ASSIGNED' && asset.can_accept && (
                      <button
                        onClick={() => openActionModal(asset, 'accept')}
                        disabled={actionLoading[asset.id]}
                        className={`${btnSuccess} px-4 py-2 rounded-lg text-sm flex items-center disabled:opacity-50 hover:shadow-md`}
                      >
                        {actionLoading[asset.id] ? (
                          <Loader size={14} className="mr-2 animate-spin" />
                        ) : (
                          <CheckSquare size={14} className="mr-2" />
                        )}
                        Accept Asset
                      </button>
                    )}

                    {asset.status === 'ASSIGNED' && asset.can_request_clarification && (
                      <button
                        onClick={() => openActionModal(asset, 'clarification')}
                        disabled={actionLoading[asset.id]}
                        className={`${btnWarning} px-4 py-2 rounded-lg text-sm flex items-center disabled:opacity-50 hover:shadow-md`}
                      >
                        {actionLoading[asset.id] ? (
                          <Loader size={14} className="mr-2 animate-spin" />
                        ) : (
                          <MessageSquare size={14} className="mr-2" />
                        )}
                        Request Clarification
                      </button>
                    )}

                    {asset.status === 'NEED_CLARIFICATION' && (
                      <button
                        onClick={() => openActionModal(asset, 'provide_clarification')}
                        disabled={actionLoading[asset.id]}
                        className={`${btnPrimary} px-4 py-2 rounded-lg text-sm flex items-center disabled:opacity-50 hover:shadow-md`}
                      >
                        {actionLoading[asset.id] ? (
                          <Loader size={14} className="mr-2 animate-spin" />
                        ) : (
                          <Reply size={14} className="mr-2" />
                        )}
                        Provide Clarification
                      </button>
                    )}

                    {(asset.status === 'ASSIGNED' || asset.status === 'NEED_CLARIFICATION') && (
                      <button
                        onClick={() => openActionModal(asset, 'cancel')}
                        disabled={actionLoading[asset.id]}
                        className={`${btnDanger} px-4 py-2 rounded-lg text-sm flex items-center disabled:opacity-50 hover:shadow-md`}
                      >
                        {actionLoading[asset.id] ? (
                          <Loader size={14} className="mr-2 animate-spin" />
                        ) : (
                          <Ban size={14} className="mr-2" />
                        )}
                        Cancel Assignment
                      </button>
                    )}

                    <button
                      onClick={() => alert(`View details for asset ${asset.asset_name}`)}
                      className={`${btnSecondary} px-4 py-2 rounded-lg text-sm flex items-center hover:shadow-md transition-all duration-200`}
                    >
                      <Eye size={14} className="mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className={`${textPrimary} text-xl font-semibold`}>
                  {actionType === 'accept' && 'Accept Asset'}
                  {actionType === 'clarification' && 'Request Clarification'}
                  {actionType === 'provide_clarification' && 'Provide Clarification'}
                  {actionType === 'cancel' && 'Cancel Assignment'}
                </h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className={`${textMuted} hover:${textPrimary} transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className={`${bgAccent} rounded-lg p-4 mb-6 border ${borderColor}`}>
                <p className={`${textPrimary} font-semibold text-lg`}>{selectedAsset.asset_name}</p>
                <p className={`${textMuted} text-sm`}>Serial: {selectedAsset.serial_number}</p>
                <p className={`${textMuted} text-sm`}>Category: {selectedAsset.category}</p>
              </div>

              <div className="space-y-4">
                {actionType === 'accept' && (
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                      Comments (Optional)
                    </label>
                    <textarea
                      value={actionData.comments}
                      onChange={(e) => setActionData(prev => ({ ...prev, comments: e.target.value }))}
                      className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                      rows="3"
                      placeholder="Add any comments about accepting this asset..."
                    />
                  </div>
                )}

                {actionType === 'clarification' && (
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                      Clarification Request *
                    </label>
                    <textarea
                      value={actionData.clarification_reason}
                      onChange={(e) => setActionData(prev => ({ ...prev, clarification_reason: e.target.value }))}
                      className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                      rows="4"
                      placeholder="Please explain what needs clarification about this asset assignment..."
                      required
                    />
                  </div>
                )}

                {actionType === 'provide_clarification' && (
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                      Clarification Response *
                    </label>
                    <textarea
                      value={actionData.clarification_response}
                      onChange={(e) => setActionData(prev => ({ ...prev, clarification_response: e.target.value }))}
                      className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                      rows="4"
                      placeholder="Please provide the requested clarification..."
                      required
                    />
                  </div>
                )}

                {actionType === 'cancel' && (
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                      Cancellation Reason *
                    </label>
                    <textarea
                      value={actionData.cancellation_reason}
                      onChange={(e) => setActionData(prev => ({ ...prev, cancellation_reason: e.target.value }))}
                      className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                      rows="3"
                      placeholder="Please explain why you want to cancel this assignment..."
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowActionModal(false)}
                  className={`${btnSecondary} px-6 py-2.5 rounded-lg text-sm hover:shadow-md transition-all duration-200`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionType === 'accept') handleAcceptAsset(selectedAsset);
                    else if (actionType === 'clarification') handleRequestClarification(selectedAsset);
                    else if (actionType === 'provide_clarification') handleProvideClarification(selectedAsset);
                    else if (actionType === 'cancel') handleCancelAssignment(selectedAsset);
                  }}
                  disabled={
                    actionLoading[selectedAsset.id] ||
                    (actionType === 'clarification' && !actionData.clarification_reason.trim()) ||
                    (actionType === 'provide_clarification' && !actionData.clarification_response.trim()) ||
                    (actionType === 'cancel' && !actionData.cancellation_reason.trim())
                  }
                  className={`${
                    actionType === 'accept' ? btnSuccess :
                    actionType === 'clarification' ? btnWarning :
                    actionType === 'provide_clarification' ? btnPrimary :
                    btnDanger
                  } px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 hover:shadow-md transition-all duration-200`}
                >
                  {actionLoading[selectedAsset.id] ? (
                    <>
                      <Loader size={14} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'accept' && 'Accept Asset'}
                      {actionType === 'clarification' && 'Request Clarification'}
                      {actionType === 'provide_clarification' && 'Provide Clarification'}
                      {actionType === 'cancel' && 'Cancel Assignment'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAssetManagement;