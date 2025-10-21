// src/app/news/page.jsx - Complete with Smaller Fonts
"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { newsService, categoryService, targetGroupService, formatApiError } from '@/services/newsService';
import { 
  Plus, Search, Calendar, Eye, Edit, Trash2, 
  X, FileText, CheckCircle, Loader2, Pin, PinOff, 
  Users, Target, Mail, Settings, Filter,
  Send
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import NewsFormModal from '@/components/news/NewsFormModal';
import { useToast } from '@/components/common/Toast';
import TargetGroupManagement from '@/components/news/TargetGroupManagement';
import CategoryManagement from '@/components/news/CategoryManagement';

export default function CompanyNewsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();

  // States
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [targetGroups, setTargetGroups] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });
  const [showTargetGroupManagement, setShowTargetGroupManagement] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load news when filters change
  useEffect(() => {
    if (categories.length > 0) {
      loadNews();
    }
  }, [currentPage, selectedCategory, searchTerm]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadTargetGroups(),
        loadStatistics()
      ]);
      await loadNews();
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
const handleTogglePublish = async (item, e) => {
  e.stopPropagation();
  try {
    await newsService.togglePublish(item.id);
    showSuccess(item.is_published ? 'News unpublished' : 'News published');
    await loadNews();
    await loadStatistics();
  } catch (error) {
    showError(formatApiError(error));
  }
};
  const loadNews = async () => {
    try {
      const params = {
        page: currentPage,
        search: searchTerm || undefined,
        ordering: '-is_pinned,-published_at'
      };

      const response = await newsService.getNews(params);
      
      setNews(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.results || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTargetGroups = async () => {
    try {
      const response = await targetGroupService.getTargetGroups();
      setTargetGroups(response.results || []);
    } catch (error) {
      console.error('Failed to load target groups:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await newsService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  // If showing management screens
  if (showTargetGroupManagement) {
    return <TargetGroupManagement onBack={() => {
      setShowTargetGroupManagement(false);
      loadTargetGroups();
    }} />;
  }

  if (showCategoryManagement) {
    return <CategoryManagement onBack={() => {
      setShowCategoryManagement(false);
      loadCategories();
      loadNews();
    }} />;
  }

  // Filter news by category
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryInfo = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? {
      id: category.id,
      name: category.name,
      icon: FileText,
      color: 'bg-almet-sapphire'
    } : {
      id: 'unknown',
      name: 'Unknown',
      icon: FileText,
      color: 'bg-gray-500'
    };
  };

  // CRUD Operations
  const handleCreateNews = () => {
    setEditingNews(null);
    setShowFormModal(true);
  };

  const handleEditNews = (item, e) => {
    e.stopPropagation();
    setEditingNews({
      ...item,
      tags: item.tags_list || [],
      imagePreview: item.image_url,
      targetGroups: item.target_groups_info?.map(g => g.id) || [],
      notifyMembers: item.notify_members,
      isPinned: item.is_pinned,
      authorDisplayName: item.author_display_name
    });
    setShowFormModal(true);
  };

  const handleSaveNews = async (formData) => {
    try {
      if (editingNews) {
        await newsService.updateNews(editingNews.id, formData);
        showSuccess('News updated successfully');
      } else {
        await newsService.createNews(formData);
        showSuccess('News created successfully');
      }
      await loadNews();
      await loadStatistics();
      setShowFormModal(false);
      setEditingNews(null);
    } catch (error) {
      showError(formatApiError(error));
      throw error;
    }
  };

  const handleDeleteNews = (item, e) => {
    e.stopPropagation();
    setConfirmModal({ isOpen: true, item });
  };

  const confirmDelete = async () => {
    try {
      await newsService.deleteNews(confirmModal.item.id);
      showSuccess('News deleted successfully');
      await loadNews();
      await loadStatistics();
      setConfirmModal({ isOpen: false, item: null });
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const handleTogglePin = async (item, e) => {
    e.stopPropagation();
    try {
      await newsService.togglePin(item.id);
      showSuccess(item.is_pinned ? 'News unpinned' : 'News pinned');
      await loadNews();
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  const handleViewNews = async (item) => {
    try {
      const fullNews = await newsService.getNewsById(item.id);
      setSelectedNews(fullNews);
      setShowNewsModal(true);
    } catch (error) {
      showError(formatApiError(error));
    }
  };

  return (
    <DashboardLayout>
      <div className={`p-6 min-h-screen transition-colors ${
        darkMode ? 'bg-gray-900' : 'bg-almet-mystic'
      }`}>
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold mb-1.5 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Company News
              </h1>
              <p className={`text-xs ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
              }`}>
                Stay updated with the latest announcements and events
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={() => setShowCategoryManagement(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl hover:shadow-lg transition-all font-medium text-xs ${
                  darkMode
                    ? 'bg-almet-cloud-burst border-almet-comet text-almet-bali-hai hover:bg-almet-comet hover:text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Settings size={15} />
                Categories
              </button>
              <button 
                onClick={() => setShowTargetGroupManagement(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl hover:shadow-lg transition-all font-medium text-xs ${
                  darkMode
                    ? 'bg-almet-cloud-burst border-almet-comet text-almet-bali-hai hover:bg-almet-comet hover:text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Users size={15} />
                Target Groups
              </button>
              <button 
                onClick={handleCreateNews}
                className="flex items-center gap-1.5 px-4 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-all font-medium text-xs shadow-lg shadow-almet-sapphire/20 hover:shadow-xl hover:shadow-almet-sapphire/30 hover:-translate-y-0.5"
              >
                <Plus size={16} />
                Create News
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Total News
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {statistics.total_news || 0}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-sky-900/30' : 'bg-sky-50'
                }`}>
                  <FileText className={`h-5 w-5 ${
                    darkMode ? 'text-sky-400' : 'text-sky-600'
                  }`} />
                </div>
              </div>
            </div>
           
            <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Published
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {statistics.published_news || 0}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-green-900/30' : 'bg-green-50'
                }`}>
                  <CheckCircle className={`h-5 w-5 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Total Views
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {(statistics.total_views || 0).toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
                }`}>
                  <Eye className={`h-5 w-5 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-4 border transition-all hover:shadow-lg ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet hover:border-almet-sapphire/50' 
                : 'bg-white border-gray-200 hover:border-almet-sapphire/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-medium mb-1 uppercase tracking-wide ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Pinned
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {statistics.pinned_news || 0}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-orange-900/30' : 'bg-orange-50'
                }`}>
                  <Pin className={`h-5 w-5 ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Filter */}
        <div className={`rounded-2xl p-3.5 mb-4 border ${
          darkMode 
            ? 'bg-almet-cloud-burst border-almet-comet' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Filter size={14} className={darkMode ? 'text-almet-bali-hai' : 'text-gray-600'} />
            <span className={`text-xs font-medium ${
              darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
            }`}>
              Filter by Category
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-almet-sapphire text-white shadow-lg shadow-almet-sapphire/20'
                  : darkMode
                    ? 'bg-almet-san-juan text-almet-bali-hai hover:bg-almet-comet'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All News
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-lg text-[10px] ${
                selectedCategory === 'all' ? 'bg-white/20' : darkMode ? 'bg-almet-comet' : 'bg-gray-200'
              }`}>
                {news.length}
              </span>
            </button>
            {categories.filter(c => c.is_active).map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-almet-sapphire text-white shadow-lg shadow-almet-sapphire/20'
                    : darkMode
                      ? 'bg-almet-san-juan text-almet-bali-hai hover:bg-almet-comet'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-lg text-[10px] ${
                  selectedCategory === category.id ? 'bg-white/20' : darkMode ? 'bg-almet-comet' : 'bg-gray-200'
                }`}>
                  {news.filter(n => n.category === category.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className={`rounded-2xl p-3.5 mb-5 border ${
          darkMode 
            ? 'bg-almet-cloud-burst border-almet-comet' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search news by title, excerpt..."
              className={`w-full pl-10 pr-3 py-2.5 text-xs border rounded-xl outline-none transition-all ${
                darkMode
                  ? 'bg-almet-san-juan border-almet-comet text-white placeholder-almet-waterloo focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:ring-2 focus:ring-almet-sapphire/20'
              }`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-almet-sapphire" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center border ${
            darkMode 
              ? 'bg-almet-cloud-burst border-almet-comet' 
              : 'bg-white border-gray-200'
          }`}>
            <FileText className={`h-14 w-14 mx-auto mb-3 ${
              darkMode ? 'text-almet-bali-hai' : 'text-gray-400'
            }`} />
            <h3 className={`text-base font-semibold mb-1.5 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No News Found
            </h3>
            <p className={`text-xs mb-3 ${
              darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
            }`}>
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first news'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={handleCreateNews}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-all text-xs font-medium shadow-lg shadow-almet-sapphire/20"
              >
                <Plus size={14} />
                Create News
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {filteredNews.map((item) => {
                const categoryInfo = getCategoryInfo(item.category);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl overflow-hidden border transition-all group relative cursor-pointer ${
                      darkMode
                        ? 'bg-almet-cloud-burst border-almet-comet hover:shadow-xl hover:shadow-almet-sapphire/10 hover:border-almet-sapphire/50'
                        : 'bg-white border-gray-200 hover:shadow-xl hover:border-almet-sapphire/50'
                    }`}
                  >
                    <div 
  className="relative h-44 overflow-hidden"
  onClick={() => handleViewNews(item)}
>
  <img
    src={item.image_url || 'https://via.placeholder.com/800x400?text=No+Image'}
    alt={item.title}
    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
  />
  
  {/* Status Badges Container */}
  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
    {item.is_pinned && (
      <div className="bg-almet-sapphire text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 shadow-lg">
        <Pin size={10} />
        Pinned
      </div>
    )}
    {!item.is_published && (
      <div className="bg-orange-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 shadow-lg">
        <FileText size={10} />
        Draft
      </div>
    )}
  </div>
  
  <div className={`absolute top-2.5 right-2.5 ${categoryInfo.color} text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 shadow-lg`}>
    <CategoryIcon size={10} />
    {categoryInfo.name}
  </div>
</div>

                    {/* Action Buttons */}
                    <div className="absolute top-48 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
  <button
    onClick={(e) => handleTogglePin(item, e)}
    className={`p-1.5 rounded-xl transition-all shadow-lg ${
      item.is_pinned 
        ? 'bg-orange-600 hover:bg-orange-700' 
        : 'bg-green-600 hover:bg-green-700'
    } text-white`}
    title={item.is_pinned ? 'Unpin' : 'Pin'}
  >
    {item.is_pinned ? <PinOff size={12} /> : <Pin size={12} />}
  </button>
  
  {/* ƏLAVƏ ET - Publish/Unpublish Button */}
  <button
    onClick={(e) => handleTogglePublish(item, e)}
    className={`p-1.5 rounded-xl transition-all shadow-lg ${
      item.is_published 
        ? 'bg-purple-600 hover:bg-purple-700' 
        : 'bg-sky-600 hover:bg-sky-700'
    } text-white`}
    title={item.is_published ? 'Unpublish' : 'Publish'}
  >
    {item.is_published ? <Eye size={12} /> : <Send size={12} />}
  </button>
  
  <button
    onClick={(e) => handleEditNews(item, e)}
    className="p-1.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all shadow-lg"
    title="Edit"
  >
    <Edit size={12} />
  </button>
  <button
    onClick={(e) => handleDeleteNews(item, e)}
    className="p-1.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg"
    title="Delete"
  >
    <Trash2 size={12} />
  </button>
</div>

                    {/* Content */}
                    <div 
                      className="p-4"
                      onClick={() => handleViewNews(item)}
                    >
                      <h3 className={`font-semibold mb-1.5 line-clamp-2 text-sm group-hover:text-almet-sapphire transition-colors ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </h3>
                      <p className={`text-xs mb-3 line-clamp-2 ${
                        darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                      }`}>
                        {item.excerpt}
                      </p>

                      {/* Target Groups */}
                      {item.target_groups_info && item.target_groups_info.length > 0 && (
                        <div className="mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className={`flex items-center gap-0.5 text-[10px] ${
                              darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                            }`}>
                              <Target size={10} />
                              <span className="font-medium">Sent to:</span>
                            </div>
                            {item.target_groups_info.slice(0, 2).map(group => (
                              <span
                                key={group.id}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                                  darkMode
                                    ? 'bg-sky-900/30 text-sky-400'
                                    : 'bg-sky-50 text-sky-700'
                                }`}
                              >
                                {group.name}
                              </span>
                            ))}
                            {item.target_groups_info.length > 2 && (
                              <span className={`text-[10px] ${
                                darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                              }`}>
                                +{item.target_groups_info.length - 2} more
                              </span>
                            )}
                            {item.notify_members && item.notification_sent && (
                              <div className="flex items-center gap-0.5 ml-auto">
                                <Mail size={10} className={
                                  darkMode ? 'text-green-400' : 'text-green-600'
                                } />
                                <span className={`text-[10px] font-medium ${
                                  darkMode ? 'text-green-400' : 'text-green-600'
                                }`}>
                                  Notified
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {item.tags_list && item.tags_list.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {item.tags_list.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-lg text-[10px] ${
                                darkMode
                                  ? 'bg-almet-san-juan text-almet-bali-hai'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className={`flex items-center justify-between pt-2.5 border-t text-[10px] ${
                        darkMode ? 'border-almet-comet' : 'border-gray-200'
                      }`}>
                        <div className={`flex items-center gap-1 ${
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                        }`}>
                          <Calendar size={10} />
                          {formatDate(item.published_at)}
                        </div>
                        <div className={`flex items-center gap-0.5 ${
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                        }`}>
                          <Eye size={10} />
                          {item.view_count} views
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                darkMode={darkMode}
              />
            )}
          </>
        )}

        {/* News Detail Modal */}
        {showNewsModal && selectedNews && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNewsModal(false)}>
            <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
              darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
            }`} onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header Image */}
              <div className="relative h-72">
                <img
                  src={selectedNews.image_url || 'https://via.placeholder.com/1200x600?text=No+Image'}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setShowNewsModal(false)}
                  className={`absolute top-3 right-3 p-2 rounded-xl shadow-lg transition-colors ${
                    darkMode
                      ? 'bg-almet-cloud-burst hover:bg-almet-comet text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X size={18} />
                </button>
                
                {/* Action Buttons in Modal */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(selectedNews, e);
                      setShowNewsModal(false);
                    }}
                    className={`p-2 rounded-xl transition-all shadow-lg ${
                      selectedNews.is_pinned 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                    title={selectedNews.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    {selectedNews.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                  </button>
                  <button
                    onClick={(e) => {
                      setShowNewsModal(false);
                      handleEditNews(selectedNews, e);
                    }}
                    className="p-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all shadow-lg"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      setShowNewsModal(false);
                      handleDeleteNews(selectedNews, e);
                    }}
                    className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Category Badge */}
                <div className={`absolute bottom-3 left-3 ${getCategoryInfo(selectedNews.category).color} text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg`}>
                  {React.createElement(getCategoryInfo(selectedNews.category).icon, { size: 14 })}
                  {getCategoryInfo(selectedNews.category).name}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-gradient-to-br from-almet-sapphire to-almet-astral text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {(selectedNews.author_display_name || selectedNews.author_name || 'S').charAt(0)}
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedNews.author_display_name || selectedNews.author_name || 'System'}
                      </p>
                      <p className={`text-[10px] ${
                        darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                      }`}>
                        {formatDate(selectedNews.published_at)}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    <Eye size={14} />
                    {selectedNews.view_count} views
                  </div>
                </div>

                <h2 className={`text-xl font-bold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedNews.title}
                </h2>

                <p className={`leading-relaxed mb-5 whitespace-pre-line text-sm ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
                }`}>
                  {selectedNews.content}
                </p>

                {/* Target Groups Section */}
                {selectedNews.target_groups_info && selectedNews.target_groups_info.length > 0 && (
                  <div className={`mb-5 p-4 rounded-xl border ${
                    darkMode
                      ? 'bg-almet-san-juan/50 border-almet-comet'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Target className="text-almet-sapphire" size={16} />
                      <h3 className={`text-xs font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Target Groups
                      </h3>
                      {selectedNews.notify_members && selectedNews.notification_sent && (
                        <div className="flex items-center gap-1 ml-auto">
                          <Mail size={12} className={
                            darkMode ? 'text-green-400' : 'text-green-600'
                          } />
                          <span className={`text-[10px] font-medium ${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            Email Sent
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNews.target_groups_info.map(group => (
                        <div
                          key={group.id}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
                            darkMode
                              ? 'bg-almet-cloud-burst border-almet-comet'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <Users size={12} className={
                            darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                          } />
                          <span className={`text-xs font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {group.name}
                          </span>
                          <span className={`text-[10px] ${
                            darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                          }`}>
                            ({group.member_count} members)
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-2.5 pt-2.5 border-t ${
                      darkMode ? 'border-almet-comet' : 'border-gray-200'
                    }`}>
                      <p className={`text-[10px] ${
                        darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                      }`}>
                        Total Recipients: <span className={`font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedNews.total_recipients} employees
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedNews.tags_list && selectedNews.tags_list.length > 0 && (
                  <div className={`flex flex-wrap gap-1.5 pt-4 border-t ${
                    darkMode ? 'border-almet-comet' : 'border-gray-200'
                  }`}>
                    {selectedNews.tags_list.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-xl text-xs ${
                          darkMode
                            ? 'bg-almet-san-juan text-almet-bali-hai'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* News Form Modal */}
        <NewsFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingNews(null);
          }}
          onSave={handleSaveNews}
          newsItem={editingNews}
          darkMode={darkMode}
          categories={categories}
          targetGroups={targetGroups}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, item: null })}
          onConfirm={confirmDelete}
          title="Delete News"
          message={`Are you sure you want to delete "${confirmModal.item?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
          darkMode={darkMode}
        />
      </div>
    </DashboardLayout>
  );
}