// src/components/job-catalog/CrudModal.jsx

import React from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';

export default function CrudModal({ context }) {
  const {
    showCrudModal, crudModalType, crudModalMode, selectedItem,
    formData, setFormData, loading, errors,
    closeCrudModal, handleCrudSubmit,
    businessFunctions, departments
  } = context;

  if (!showCrudModal) return null;

  const getModalTitle = () => {
    const typeNames = {
      business_functions: 'Business Function',
      departments: 'Department',
      units: 'Unit',
      job_functions: 'Job Function',
      position_groups: 'Position Group'
    };
    const typeName = typeNames[crudModalType] || 'Item';
    return `${crudModalMode === 'create' ? 'Create' : 'Edit'} ${typeName}`;
  };

  const renderFormFields = () => {
    switch (crudModalType) {
      case 'business_functions':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                placeholder="Enter business function name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                Code
              </label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                placeholder="Enter code (e.g., HLD, TRD)"
              />
            </div>
          </>
        );

      case 'departments':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                placeholder="Enter department name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                Business Function *
              </label>
              <select
                value={formData.business_function || ''}
                onChange={(e) => setFormData({...formData, business_function: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                required
              >
                <option value="">Select Business Function</option>
                {businessFunctions.map(bf => (
                  <option key={bf.value} value={bf.value}>{bf.label}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'units':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                placeholder="Enter unit name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                Department *
              </label>
              <select
                value={formData.department || ''}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'job_functions':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              placeholder="Enter job function name"
              required
            />
          </div>
        );

      case 'position_groups':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                placeholder="Enter position group name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                Hierarchy Level *
              </label>
              <input
                type="number"
                value={formData.hierarchy_level || ''}
                onChange={(e) => setFormData({...formData, hierarchy_level: parseInt(e.target.value)})}
                className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                placeholder="Enter hierarchy level (1-10)"
                min="1"
                max="10"
                required
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-almet-comet">
        <div className="p-6 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {getModalTitle()}
            </h2>
            <button
              onClick={closeCrudModal}
              className="p-2 hover:bg-gray-100 dark:hover:bg-almet-comet rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-almet-bali-hai" />
            </button>
          </div>
        </div>

        <form onSubmit={handleCrudSubmit} className="p-6">
          {renderFormFields()}
          
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="mr-3 w-4 h-4 text-almet-sapphire bg-gray-100 border-gray-300 rounded focus:ring-almet-sapphire dark:focus:ring-almet-sapphire dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-almet-bali-hai">Active</span>
            </label>
          </div>

          {errors.crud && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200 text-sm">{errors.crud}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-almet-comet">
            <button
              type="button"
              onClick={closeCrudModal}
              disabled={loading.crud}
              className="px-6 py-3 border border-gray-300 dark:border-almet-comet text-gray-700 dark:text-almet-bali-hai rounded-lg hover:bg-gray-50 dark:hover:bg-almet-comet transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.crud}
              className="flex items-center gap-2 px-6 py-3 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading.crud ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {crudModalMode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {crudModalMode === 'create' ? 'Create' : 'Update'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}