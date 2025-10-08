// src/components/news/NewsFormModal.jsx - With Image Upload & Drop
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Upload, Tag, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function NewsFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  newsItem = null, 
  darkMode = false 
}) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'announcement',
    image: null,
    imagePreview: '',
    tags: [],
    isPinned: false
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (newsItem) {
      setFormData({
        title: newsItem.title || '',
        excerpt: newsItem.excerpt || '',
        content: newsItem.content || '',
        category: newsItem.category || 'announcement',
        image: newsItem.image || null,
        imagePreview: newsItem.imagePreview || '',
        tags: newsItem.tags || [],
        isPinned: newsItem.isPinned || false
      });
    } else {
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: 'announcement',
        image: null,
        imagePreview: '',
        tags: [],
        isPinned: false
      });
    }
    setErrors({});
  }, [newsItem, isOpen]);

  if (!isOpen) return null;

  const categories = [
    { id: 'announcement', name: 'Announcement' },
    { id: 'event', name: 'Event' },
    { id: 'achievement', name: 'Achievement' },
    { id: 'update', name: 'Update' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: null }));
    } else {
      setErrors(prev => ({ ...prev, image: 'Please upload a valid image file' }));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.imagePreview) newErrors.image = 'Image is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to save news' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const inputClass = `w-full px-3 py-2.5 text-sm border outline-none rounded-lg transition-colors
    ${darkMode 
      ? 'bg-almet-san-juan border-almet-comet text-white focus:border-almet-sapphire' 
      : 'bg-white border-gray-300 text-gray-900 focus:border-almet-sapphire'
    }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${
    darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border ${
        darkMode 
          ? 'bg-almet-cloud-burst border-almet-comet' 
          : 'bg-white border-gray-200'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          darkMode ? 'border-almet-comet' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {newsItem ? 'Edit News' : 'Create News'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-almet-comet text-almet-bali-hai' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            
            {/* Title */}
            <div>
              <label className={labelClass}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={inputClass}
                placeholder="Enter news title"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category & Pinned */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={inputClass}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="w-4 h-4 text-almet-sapphire bg-gray-100 border-gray-300 rounded focus:ring-almet-sapphire"
                  />
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
                  }`}>
                    Pin this news
                  </span>
                </label>
              </div>
            </div>

            {/* Image Upload - Drag & Drop */}
            <div>
              <label className={labelClass}>
                Image <span className="text-red-500">*</span>
              </label>
              
              {!formData.imagePreview ? (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-almet-sapphire bg-almet-sapphire/5' 
                      : darkMode
                        ? 'border-almet-comet bg-almet-san-juan hover:border-almet-sapphire'
                        : 'border-gray-300 bg-gray-50 hover:border-almet-sapphire'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  <ImageIcon className={`mx-auto mb-4 ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-400'
                  }`} size={48} />
                  
                  <p className={`text-sm font-medium mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Drag and drop your image here
                  </p>
                  
                  <p className={`text-xs mb-4 ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                  }`}>
                    or
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium"
                  >
                    <Upload size={16} />
                    Browse Files
                  </button>
                  
                  <p className={`text-xs mt-3 ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                  }`}>
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">{errors.image}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className={labelClass}>
                Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className={inputClass}
                rows="3"
                placeholder="Brief summary of the news"
                maxLength={200}
              />
              {errors.excerpt && (
                <p className="text-red-500 text-xs mt-1">{errors.excerpt}</p>
              )}
              <p className={`text-xs mt-1 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
              }`}>
                {formData.excerpt.length}/200 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className={labelClass}>
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className={inputClass}
                rows="8"
                placeholder="Full news content"
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className={labelClass}>Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className={inputClass}
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium whitespace-nowrap"
                >
                  <Tag size={16} />
                </button>
              </div>
              
              {/* Tag List */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm ${
                        darkMode 
                          ? 'bg-almet-san-juan text-almet-bali-hai' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                darkMode 
                  ? 'bg-red-900/20 border-red-800 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <AlertCircle size={16} />
                <span className="text-sm">{errors.submit}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={`flex justify-end gap-3 mt-6 pt-4 border-t ${
            darkMode ? 'border-almet-comet' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                darkMode
                  ? 'border border-almet-comet text-almet-bali-hai hover:bg-almet-comet'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {newsItem ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}