// src/components/assets/AssetManagementModals.jsx - COMPLETE
"use client";
import { useState } from "react";
import { 
  XCircle, 
  Plus, 
  Edit, 
  Loader, 
} from "lucide-react";
import { assetService } from "@/services/assetService";
import SearchableDropdown from "@/components/common/SearchableDropdown";

// Add Asset Modal Component
export const AddAssetModal = ({ onClose, onSuccess, categories, darkMode }) => {
  const [formData, setFormData] = useState({
    asset_name: "",
    category: "",
    serial_number: "",
    purchase_price: "",
    purchase_date: "",
    useful_life_years: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await assetService.createAsset(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create asset");
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
      <div className={`${bgCard} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>Add New Asset</h2>
            <button
              type="button"
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Asset Name *
              </label>
              <input
                type="text"
                name="asset_name"
                value={formData.asset_name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border outline-0 ${borderColor} rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                placeholder="Enter asset name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Category *
              </label>
              <SearchableDropdown
                options={categoryOptions}
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                placeholder="Select category"
                searchPlaceholder="Search categories..."
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Serial Number *
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                placeholder="Enter serial number"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Purchase Price *
              </label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border outline-0 ${borderColor} rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                placeholder="Enter purchase price"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Purchase Date *
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Useful Life (Years) *
              </label>
              <input
                type="number"
                name="useful_life_years"
                value={formData.useful_life_years}
                onChange={handleChange}
                required
                min="1"
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Asset Modal Component
export const EditAssetModal = ({ asset, onClose, onSuccess, categories, darkMode }) => {
  const [formData, setFormData] = useState({
    asset_name: asset.asset_name || "",
    category: asset.category?.id || "",
    serial_number: asset.serial_number || "",
    purchase_price: asset.purchase_price || "",
    purchase_date: asset.purchase_date || "",
    useful_life_years: asset.useful_life_years || 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await assetService.updateAsset(asset.id, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update asset");
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
      <div className={`${bgCard} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>Edit Asset</h2>
            <button
              type="button"
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Asset Name *
              </label>
              <input
                type="text"
                name="asset_name"
                value={formData.asset_name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                placeholder="Enter asset name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Category *
              </label>
              <SearchableDropdown
                options={categoryOptions}
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                placeholder="Select category"
                searchPlaceholder="Search categories..."
                darkMode={darkMode}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Serial Number *
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                placeholder="Enter serial number"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Purchase Price *
              </label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                placeholder="Enter purchase price"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Purchase Date *
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Useful Life (Years) *
              </label>
              <input
                type="number"
                name="useful_life_years"
                value={formData.useful_life_years}
                onChange={handleChange}
                required
                min="1"
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-1 outline-0 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                  Updating...
                </>
              ) : (
                <>
                  <Edit size={16} className="mr-2" />
                  Update Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};