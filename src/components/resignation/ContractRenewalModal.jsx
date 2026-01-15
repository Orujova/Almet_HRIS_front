'use client';
import React, { useState } from 'react';
import { X, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ContractRenewalModal({ contract, onClose, onSuccess, userRole }) {
  const [formData, setFormData] = useState({
    decision: '',
    new_contract_type: 'PERMANENT',
    new_contract_duration_months: 12,
    salary_change: false,
    new_salary: '',
    position_change: false,
    new_position: '',
    comments: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const canMakeDecision = () => {
    return userRole === 'manager' || userRole === 'admin';
  };

  const handleSubmit = async () => {
    if (!formData.decision) {
      alert('Please select a decision');
      return;
    }

    if (formData.decision === 'RENEW') {
      if (!formData.new_contract_type) {
        alert('Please select new contract type');
        return;
      }
      if (formData.new_contract_type !== 'PERMANENT' && !formData.new_contract_duration_months) {
        alert('Please specify contract duration');
        return;
      }
      if (formData.salary_change && !formData.new_salary) {
        alert('Please enter new salary amount');
        return;
      }
      if (formData.position_change && !formData.new_position.trim()) {
        alert('Please enter new position title');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      await resignationExitService.contractRenewal.managerDecision(
        contract.id,
        formData
      );

      alert('Contract decision submitted successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('Error submitting decision:', err);
      alert('Failed to submit decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value || '-'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold">Contract Renewal Decision</h2>
            <p className="text-green-100 mt-0.5 text-xs">
              {contract.employee_name} - {contract.employee_id}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Employee Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Employee Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <InfoItem label="Name" value={contract.employee_name} />
              <InfoItem label="Position" value={contract.position} />
              <InfoItem label="Department" value={contract.department} />
              <InfoItem label="Current Contract" value={contract.current_contract_type} />
              <InfoItem 
                label="Contract Expires" 
                value={resignationExitService.helpers.formatDate(contract.current_contract_end_date)} 
              />
              <InfoItem 
                label="Days Remaining" 
                value={`${contract.days_until_expiry} days`} 
              />
            </div>
          </div>

          {/* Decision */}
          {canMakeDecision() && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Renewal Decision <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 transition-all">
                    <input 
                      type="radio" 
                      name="decision" 
                      value="RENEW"
                      checked={formData.decision === 'RENEW'}
                      onChange={(e) => setFormData({...formData, decision: e.target.value})}
                      className="w-4 h-4 text-green-600 mt-0.5"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        ✅ Renew Contract
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Continue employment with new terms
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 transition-all">
                    <input 
                      type="radio" 
                      name="decision" 
                      value="NOT_RENEW"
                      checked={formData.decision === 'NOT_RENEW'}
                      onChange={(e) => setFormData({...formData, decision: e.target.value})}
                      className="w-4 h-4 text-red-600 mt-0.5"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        ❌ Do Not Renew
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Let contract expire
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Renewal Terms (only if renewing) */}
              {formData.decision === 'RENEW' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Contract Type <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.new_contract_type}
                      onChange={(e) => setFormData({...formData, new_contract_type: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="PERMANENT">Permanent Contract</option>
                      <option value="3_MONTHS">3 Months</option>
                      <option value="6_MONTHS">6 Months</option>
                      <option value="1_YEAR">1 Year</option>
                      <option value="2_YEARS">2 Years</option>
                    </select>
                  </div>

                  {formData.new_contract_type !== 'PERMANENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contract Duration (months) <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={formData.new_contract_duration_months}
                        onChange={(e) => setFormData({...formData, new_contract_duration_months: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="18">18 months</option>
                        <option value="24">24 months</option>
                      </select>
                    </div>
                  )}

                  {/* Salary Change */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.salary_change}
                        onChange={(e) => setFormData({...formData, salary_change: e.target.checked})}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Salary Adjustment
                      </span>
                    </label>
                  </div>

                  {formData.salary_change && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Salary Amount (AZN) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number"
                        value={formData.new_salary}
                        onChange={(e) => setFormData({...formData, new_salary: e.target.value})}
                        placeholder="Enter new salary..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Position Change */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.position_change}
                        onChange={(e) => setFormData({...formData, position_change: e.target.checked})}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Position Change
                      </span>
                    </label>
                  </div>

                  {formData.position_change && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Position Title <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        value={formData.new_position}
                        onChange={(e) => setFormData({...formData, new_position: e.target.value})}
                        placeholder="Enter new position..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comments / Notes
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  rows={3}
                  placeholder="Add any additional notes or comments..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={16} />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">After Submission:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Decision will be forwarded to HR department</li>
                      <li>HR will update employee contract and salary information</li>
                      <li>Employee will be notified via email</li>
                      {formData.decision === 'NOT_RENEW' && (
                        <li className="text-red-600 dark:text-red-400 font-medium">
                          HR will initiate exit process
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-5 py-3 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
          <button 
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          {canMakeDecision() && (
            <button 
              onClick={handleSubmit}
              disabled={submitting || !formData.decision}
              className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Submit Decision
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}