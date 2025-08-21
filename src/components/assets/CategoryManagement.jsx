// src/components/assets/CategoryManagement.jsx - Category CRUD operations for settings
"use client";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Building, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Settings,
  Calendar,
  User,
  Eye,
  EyeOff
} from "lucide-react";
import { categoryService } from "@/services/assetService";

const CategoryManagement = ({ darkMode }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

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
  const btnDanger = "bg-red-500 hover:bg-red-600 text-white transition-all duration-200";
  const shadowClass = darkMode ? "" : "shadow-sm";
  const bgAccent = darkMode ? "bg-gray-700/50" : "bg-almet-mystic/30";

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories();
      setCategories(response.results || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete category
  const handleDeleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await categoryService.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category. It may be in use by existing assets.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`${textPrimary} text-2xl font-bold mb-2`}>Asset Categories</h2>
          <p className={`${textMuted} text-sm`}>
            Manage asset categories for better organization and tracking
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`${btnPrimary} px-4 py-2.5 rounded-lg flex items-center text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
        >
          <Plus size={16} className="mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className={`${bgCard} rounded-xl ${shadowClass} border ${borderColor} p-4`}>
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
          />
        </div>
      </div>

      {/* Categories List */}
      <div className={`${bgCard} rounded-xl ${shadowClass} border ${borderColor} overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-almet-sapphire mr-3" />
            <span className={`${textMuted}`}>Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className={`${textMuted} text-lg font-medium`}>No categories found</p>
            <p className={`${textMuted} text-sm`}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Create your first asset category to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y-8 divide-gray-200 dark:divide-gray-700">
            {filteredCategories.map((category) => (
              <div key={category.id} className={`py-3 px-6 hover:${bgAccent} transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-almet-sapphire/10 rounded-lg flex items-center justify-center mr-3">
                        <Building size={16} className="text-almet-sapphire" />
                      </div>
                      <div>
                        <h3 className={`${textPrimary} font-semibold text-base`}>{category.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`${textMuted} text-xs flex items-center`}>
                            <Package size={12} className="mr-1" />
                            {category.asset_count} assets
                          </span>
                          <span className={`${textMuted} text-xs flex items-center`}>
                            <Calendar size={12} className="mr-1" />
                            Created {formatDate(category.created_at)}
                          </span>
                          <span className={`${textMuted} text-xs flex items-center`}>
                            <User size={12} className="mr-1" />
                            By {category.created_by_name}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            category.is_active 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700/50'
                          }`}>
                            {category.is_active ? (
                              <>
                                <CheckCircle size={10} className="mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={10} className="mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                 
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className={`${btnSecondary} px-2 py-2 rounded-lg text-xs flex items-center hover:shadow-md transition-all duration-200`}
                    >
                      <Edit size={12} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={actionLoading[category.id] || category.asset_count > 0}
                      className={`${btnDanger} px-2 py-2 rounded-lg text-xs flex items-center disabled:opacity-50 hover:shadow-md transition-all duration-200`}
                      title={category.asset_count > 0 ? "Cannot delete category with existing assets" : "Delete category"}
                    >
                      {actionLoading[category.id] ? (
                        <Loader size={12} className="mr-1 animate-spin" />
                      ) : (
                        <Trash2 size={12} className="mr-1" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <CategoryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCategories();
          }}
          darkMode={darkMode}
        />
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
            fetchCategories();
          }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// Category Modal Component (Add/Edit)
const CategoryModal = ({ category, onClose, onSuccess, darkMode }) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    is_active: category?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  const isEditing = !!category;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        await categoryService.updateCategory(category.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl w-full max-w-lg shadow-2xl border ${borderColor}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${textPrimary} text-xl font-bold`}>
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
            >
              <XCircle size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm transition-all duration-200`}
                rows="3"
                placeholder="Enter category description (optional)"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire h-4 w-4"
              />
              <label htmlFor="is_active" className={`ml-2 text-sm ${textPrimary}`}>
                Active category
              </label>
            </div>
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
              disabled={loading}
              className={`${btnPrimary} px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 flex items-center hover:shadow-md transition-all duration-200`}
            >
              {loading ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <Edit size={16} className="mr-2" />
                      Update Category
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-2" />
                      Create Category
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

export default CategoryManagement;