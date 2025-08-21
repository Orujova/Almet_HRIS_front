"use client";
import { useState } from "react";

import {  employeeAssetService } from "@/services/assetService";
import {
 
  Loader,
 
  XCircle,

  Ban,
  Reply,
 
} from "lucide-react";

const EmployeeAssetActionModal = ({ asset, employeeId, onClose, onSuccess, darkMode, actionType }) => {
  const [actionData, setActionData] = useState({
    clarification_response: '',
    cancellation_reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/30";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";
  const btnDanger = "bg-red-500 hover:bg-red-600 text-white transition-all duration-200";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (actionType === 'provide_clarification') {
        await employeeAssetService.provideClarification(employeeId, {
          asset_id: asset.id,
          clarification_response: actionData.clarification_response
        });
      } else if (actionType === 'cancel_assignment') {
        await employeeAssetService.cancelAssignment(employeeId, {
          asset_id: asset.id,
          cancellation_reason: actionData.cancellation_reason
        });
      }
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType.replace('_', ' ')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className={`${textPrimary} text-xl font-semibold`}>
              {actionType === 'provide_clarification' ? 'Provide Clarification' : 'Cancel Assignment'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
            >
              <XCircle size={20} />
            </button>
          </div>

          <div className={`${bgAccent} rounded-lg p-4 mb-6 border ${borderColor}`}>
            <p className={`${textPrimary} font-semibold text-lg`}>{asset.asset_name}</p>
            <p className={`${textMuted} text-sm`}>Serial: {asset.serial_number}</p>
            <p className={`${textMuted} text-sm`}>Category: {asset.category_name}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {actionType === 'provide_clarification' && (
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Clarification Response *
                </label>
                <textarea
                  name="clarification_response"
                  value={actionData.clarification_response}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                  rows="4"
                  placeholder="Please provide the requested clarification..."
                  required
                />
              </div>
            )}

            {actionType === 'cancel_assignment' && (
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Cancellation Reason *
                </label>
                <textarea
                  name="cancellation_reason"
                  value={actionData.cancellation_reason}
                  onChange={handleChange}
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
              type="button"
              onClick={onClose}
              className={`${btnSecondary} px-6 py-2.5 rounded-lg text-sm hover:shadow-md transition-all duration-200`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (actionType === 'provide_clarification' && !actionData.clarification_response.trim()) ||
                (actionType === 'cancel_assignment' && !actionData.cancellation_reason.trim())
              }
              className={`${
                actionType === 'provide_clarification' ? btnPrimary : btnDanger
              } px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 hover:shadow-md transition-all duration-200`}
            >
              {loading ? (
                <>
                  <Loader size={14} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'provide_clarification' ? (
                    <>
                      <Reply size={14} className="mr-2" />
                      Provide Clarification
                    </>
                  ) : (
                    <>
                      <Ban size={14} className="mr-2" />
                      Cancel Assignment
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeAssetActionModal;