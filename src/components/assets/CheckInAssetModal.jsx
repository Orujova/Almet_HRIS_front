import React, { useState } from 'react';
import { 
  XCircle, 
  Loader, 
  LogIn
} from 'lucide-react';
import { assetService } from '@/services/assetService';
import SearchableDropdown from '../common/SearchableDropdown';

// Check In Asset Modal



const CheckInAssetModal = ({ asset, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    check_in_date: new Date().toISOString().split('T')[0],
    check_in_notes: '',
    condition_on_checkin: 'EXCELLENT'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/30";
  const btnPrimary = "bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  const conditionOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
    { value: 'DAMAGED', label: 'Damaged' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await assetService.checkInAsset(asset.id, formData);
      onSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in asset');
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>Check In Asset</h2>
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
            {asset.assigned_to && (
              <p className={`${textMuted} text-xs`}>Currently assigned to: {asset.assigned_to.full_name || asset.assigned_to_name}</p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Check In Date *
              </label>
              <input
                type="date"
                name="check_in_date"
                value={formData.check_in_date}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Condition on Check In *
              </label>
              <SearchableDropdown
                options={conditionOptions}
                value={formData.condition_on_checkin}
                onChange={(value) => setFormData(prev => ({ ...prev, condition_on_checkin: value }))}
                placeholder="Select condition"
                searchPlaceholder="Search conditions..."
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Check In Notes
              </label>
              <textarea
                name="check_in_notes"
                value={formData.check_in_notes}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm`}
                rows="3"
                placeholder="Add any notes about the asset condition or check-in process..."
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
              disabled={loading}
              className={`${btnPrimary} px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 flex items-center hover:shadow-md transition-all duration-200`}
            >
              {loading ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <LogOut size={16} className="mr-2" />
                  Check In Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInAssetModal;