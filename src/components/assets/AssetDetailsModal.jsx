// src/components/assets/AssetDetailsModal.jsx - UPDATED
"use client";
import { useState } from "react";
import { 
  XCircle, 
  Edit, 
  Package, 
  Settings,
  User,
  BarChart3,
  LogOut,
  RotateCcw,
  Calendar,
  Building,
  DollarSign,
  FileText
} from "lucide-react";
import CheckInAssetModal from "@/components/assets/CheckInAssetModal";
import ChangeStatusModal from "@/components/assets/ChangeStatusModal";

export const AssetDetailsModal = ({ asset, onClose, darkMode, onEdit, onCheckIn, onChangeStatus }) => {
  const [loading, setLoading] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/30";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";
  const btnSuccess = "bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200";
  const btnWarning = "bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200";

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

  const getStatusColor = (status) => {
    const statusColors = {
      'IN_STOCK': 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-900/30',
      'IN_USE': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/30',
      'ASSIGNED': 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/30',
      'NEED_CLARIFICATION': 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-900/30',
      'IN_REPAIR': 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/30',
      'ARCHIVED': 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-900/30'
    };
    return statusColors[status] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const handleCheckIn = () => {
    setShowCheckInModal(true);
  };

  const handleChangeStatus = () => {
    setShowStatusModal(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${bgCard} rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border ${borderColor}`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className={`${textPrimary} text-2xl font-bold mb-2`}>{asset.asset_name}</h2>
                <p className={`${textMuted} text-sm`}>Serial Number: {asset.serial_number}</p>
              </div>
              <button
                onClick={onClose}
                className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className={`${bgAccent} rounded-lg p-6 border ${borderColor}`}>
                  <h3 className={`${textPrimary} font-semibold mb-4 text-lg flex items-center`}>
                    <Package size={18} className="mr-2 text-almet-sapphire" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium ${textMuted} mb-1`}>Asset Name</label>
                      <p className={`${textPrimary} text-sm font-medium`}>{asset.asset_name}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${textMuted} mb-1`}>Serial Number</label>
                      <p className={`${textPrimary} text-sm font-medium`}>{asset.serial_number}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${textMuted} mb-1`}>Category</label>
                      <div className="flex items-center">
                        <Building size={14} className={`${textMuted} mr-2`} />
                        <p className={`${textPrimary} text-sm font-medium`}>{asset.category?.name || asset.category_name}</p>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${textMuted} mb-1`}>Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(asset.status)}`}>
                        {asset.status_display}
                      </span>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${textMuted} mb-1`}>Purchase Price</label>
                      <div className="flex items-center">
                        <DollarSign size={14} className={`${textMuted} mr-1`} />
                        <p className={`${textPrimary} text-sm font-medium`}>{formatCurrency(asset.purchase_price)}</p>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${textMuted} mb-1`}>Purchase Date</label>
                      <div className="flex items-center">
                        <Calendar size={14} className={`${textMuted} mr-1`} />
                        <p className={`${textPrimary} text-sm font-medium`}>{formatDate(asset.purchase_date)}</p>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${textMuted} mb-1`}>Useful Life</label>
                      <p className={`${textPrimary} text-sm font-medium`}>{asset.useful_life_years} years</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${textMuted} mb-1`}>Created At</label>
                      <p className={`${textPrimary} text-sm font-medium`}>{formatDate(asset.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Assignment Information */}
                {asset.assigned_to && (
                  <div className={`${bgAccent} rounded-lg p-6 border ${borderColor}`}>
                    <h3 className={`${textPrimary} font-semibold mb-4 text-lg flex items-center`}>
                      <User size={18} className="mr-2 text-almet-sapphire" />
                      Current Assignment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-medium ${textMuted} mb-1`}>Employee</label>
                        <p className={`${textPrimary} text-sm font-medium`}>
                          {asset.assigned_to.full_name || asset.assigned_to_name}
                        </p>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium ${textMuted} mb-1`}>Employee ID</label>
                        <p className={`${textPrimary} text-sm font-medium`}>
                          {asset.assigned_to.employee_id || asset.assigned_to_employee_id}
                        </p>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium ${textMuted} mb-1`}>Job Title</label>
                        <p className={`${textPrimary} text-sm font-medium`}>{asset.assigned_to.job_title}</p>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium ${textMuted} mb-1`}>Assignment Date</label>
                        <p className={`${textPrimary} text-sm font-medium`}>
                          {formatDate(asset.current_assignment?.assignment?.check_out_date)}
                        </p>
                      </div>
                      {asset.current_assignment?.assignment?.check_out_notes && (
                        <div className="md:col-span-2">
                          <label className={`block text-xs font-medium ${textMuted} mb-1`}>Assignment Notes</label>
                          <p className={`${textSecondary} text-sm`}>
                            {asset.current_assignment.assignment.check_out_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Batch Information */}
                {asset.batch && (
                  <div className={`${bgAccent} rounded-lg p-6 border ${borderColor}`}>
                    <h3 className={`${textPrimary} font-semibold mb-4 text-lg flex items-center`}>
                      <FileText size={18} className="mr-2 text-almet-sapphire" />
                      Batch Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-medium ${textMuted} mb-1`}>Batch Number</label>
                        <p className={`${textPrimary} text-sm font-medium`}>{asset.batch.batch_number}</p>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium ${textMuted} mb-1`}>Supplier</label>
                        <p className={`${textPrimary} text-sm font-medium`}>{asset.batch.supplier || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Panel */}
              <div className="space-y-4">
                <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                  <h3 className={`${textPrimary} font-semibold mb-4 text-lg flex items-center`}>
                    <Settings size={18} className="mr-2 text-almet-sapphire" />
                    Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={onEdit}
                      className={`w-full ${btnPrimary} px-4 py-2.5 rounded-lg text-sm flex items-center justify-center hover:shadow-md`}
                    >
                      <Edit size={14} className="mr-2" />
                      Edit Asset
                    </button>
                    
                    {asset.can_be_checked_in && (
                      <button
                        onClick={handleCheckIn}
                        className={`w-full ${btnSuccess} px-4 py-2.5 rounded-lg text-sm flex items-center justify-center hover:shadow-md`}
                      >
                        <LogOut size={14} className="mr-2" />
                        Check In Asset
                      </button>
                    )}
                    
                    <button
                      onClick={handleChangeStatus}
                      className={`w-full ${btnWarning} px-4 py-2.5 rounded-lg text-sm flex items-center justify-center hover:shadow-md`}
                    >
                      <RotateCcw size={14} className="mr-2" />
                      Change Status
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                  <h3 className={`${textPrimary} font-semibold mb-4 text-lg flex items-center`}>
                    <BarChart3 size={18} className="mr-2 text-almet-sapphire" />
                    Asset Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`${textMuted} text-sm`}>Total Assignments</span>
                      <span className={`${textPrimary} font-semibold`}>{asset.assignments?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${textMuted} text-sm`}>Activities</span>
                      <span className={`${textPrimary} font-semibold`}>{asset.activities?.length || 0}</span>
                    </div>
                    {asset.current_assignment && (
                      <div className="flex justify-between items-center">
                        <span className={`${textMuted} text-sm`}>Days Assigned</span>
                        <span className={`${textPrimary} font-semibold`}>
                          {asset.current_assignment.assignment.duration_days} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Check In Modal */}
      {showCheckInModal && (
        <CheckInAssetModal
          asset={asset}
          onClose={() => setShowCheckInModal(false)}
          onSuccess={(updatedAsset) => {
            setShowCheckInModal(false);
            onCheckIn && onCheckIn(updatedAsset);
          }}
          darkMode={darkMode}
        />
      )}

      {/* Change Status Modal */}
      {showStatusModal && (
        <ChangeStatusModal
          asset={asset}
          onClose={() => setShowStatusModal(false)}
          onSuccess={(updatedAsset) => {
            setShowStatusModal(false);
            onChangeStatus && onChangeStatus(updatedAsset);
          }}
          darkMode={darkMode}
        />
      )}
    </>
  );
};