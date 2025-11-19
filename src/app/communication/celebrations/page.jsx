"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import celebrationService from "@/services/celebrationService";
import { 
  Plus, Search, Calendar, Cake, Award, Gift, PartyPopper,
  Edit, Trash2, X, Loader2, TrendingUp, ChevronLeft, ChevronRight,
  Building2, Briefcase, Image as ImageIcon, Heart
} from 'lucide-react';

export default function CelebrationsPage() {
  const { darkMode } = useTheme();
  const [celebrations, setCelebrations] = useState([]);
  const [selectedCelebration, setSelectedCelebration] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statistics, setStatistics] = useState({
    total_celebrations: 0,
    this_month: 0,
    upcoming: 0,
    total_wishes: 0
  });
  const [formData, setFormData] = useState({
    type: 'company_event',
    title: '',

    date: '',
    message: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [wishMessage, setWishMessage] = useState('');
  const [showWishModal, setShowWishModal] = useState(false);

  const celebrationTypes = [
    { id: 'all', name: 'All Celebrations', icon: PartyPopper, color: 'bg-almet-sapphire' },
    { id: 'birthday', name: 'Birthdays', icon: Cake, color: 'bg-pink-500' },
    { id: 'work_anniversary', name: 'Work Anniversary', icon: Award, color: 'bg-purple-500' },
    { id: 'company_event', name: 'Company Events', icon: Building2, color: 'bg-green-500' },
    { id: 'achievement', name: 'Achievements', icon: Briefcase, color: 'bg-amber-500' },
    { id: 'other', name: 'Other', icon: Gift, color: 'bg-orange-500' }
  ];

  const months = [
    { id: 'all', name: 'All Months' },
    ...Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      const monthName = new Date(2024, i, 1).toLocaleString('en-US', { month: 'long' });
      return { id: monthNum, name: monthName };
    })
  ];

  useEffect(() => { 
    loadCelebrations(); 
    loadStatistics();
  }, []);

  const loadCelebrations = async () => {
    setLoading(true);
    try {
      const data = await celebrationService.getAllCelebrations();
      setCelebrations(data);
    } catch (error) {
      console.error('Error loading celebrations:', error);
      alert('Error loading celebrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await celebrationService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateCelebration = async () => {
    try {
      if (!formData.title || !formData.date || !formData.message) {
        alert('Please fill in all required fields');
        return;
      }

      const celebrationData = {
        type: formData.type,
        title: formData.title,

        date: formData.date,
        message: formData.message,
        images: imageFiles
      };

      await celebrationService.createCelebration(celebrationData);
      
      setShowCreateModal(false);
      resetForm();
      loadCelebrations();
      loadStatistics();
      
      alert('Celebration created successfully!');
    } catch (error) {
      console.error('Error creating celebration:', error);
      alert('Error creating celebration. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'company_event',
      title: '',
  
      date: '',
      message: ''
    });
    setImageFiles([]);
    setImagePreview([]);
  };

  const handleAddWish = async () => {
    try {
      if (!wishMessage.trim()) {
        alert('Please enter a wish message');
        return;
      }

      if (selectedCelebration.is_auto) {
        // Auto celebration (birthday or work anniversary)
        await celebrationService.addAutoWish(
          selectedCelebration.employee_id,
          selectedCelebration.type,
          wishMessage
        );
      } else {
        // Manual celebration
        await celebrationService.addWish(
          selectedCelebration.id,
          wishMessage
        );
      }

      setWishMessage('');
      setShowWishModal(false);
      loadCelebrations();
      loadStatistics();
      
      alert('Wish added successfully!');
    } catch (error) {
      console.error('Error adding wish:', error);
      alert('Error adding wish. Please try again.');
    }
  };

  const filteredCelebrations = celebrations.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) 
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesMonth = selectedMonth === 'all' || item.date.split('-')[1] === selectedMonth;
    return matchesSearch && matchesType && matchesMonth;
  });

  const sortedCelebrations = [...filteredCelebrations].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalPages = Math.ceil(sortedCelebrations.length / itemsPerPage);
  const paginatedCelebrations = sortedCelebrations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => { 
    setCurrentPage(page); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const getTypeInfo = (typeId) => celebrationTypes.find(type => type.id === typeId) || celebrationTypes[0];

  const handleEditCelebration = (item, e) => { 
    e.stopPropagation(); 
    if (item.is_auto) {
      alert('Cannot edit auto-generated celebrations (birthdays and work anniversaries)');
      return;
    }
    alert('Edit functionality - To be implemented');
  };

  const handleDeleteCelebration = (item, e) => { 
    e.stopPropagation();
    if (item.is_auto) {
      alert('Cannot delete auto-generated celebrations (birthdays and work anniversaries)');
      return;
    }
    setConfirmModal({ isOpen: true, item }); 
  };

  const confirmDelete = async () => { 
    try {
      await celebrationService.deleteCelebration(confirmModal.item.id);
      setConfirmModal({ isOpen: false, item: null });
      loadCelebrations();
      loadStatistics();
      alert('Celebration deleted successfully!');
    } catch (error) {
      console.error('Error deleting celebration:', error);
      alert('Error deleting celebration. Please try again.');
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedCelebration) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedCelebration.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedCelebration) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedCelebration.images.length) % selectedCelebration.images.length);
    }
  };

  return (
    <DashboardLayout>
      <div className={`p-4 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-almet-mystic'}`}>
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Company Celebrations
              </h1>
              <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                Celebrate milestones together
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-almet-sapphire text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Create Celebration
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs mb-1 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>Total</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{statistics.total_celebrations}</p>
              </div>
              <div className="p-3 bg-almet-sapphire/10 rounded-lg">
                <PartyPopper className="h-6 w-6 text-almet-sapphire" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs mb-1 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>This Month</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{statistics.this_month}</p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Calendar className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs mb-1 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>Upcoming</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{statistics.upcoming}</p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <TrendingUp className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs mb-1 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>Wishes</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{statistics.total_wishes}</p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-pink-900/30' : 'bg-pink-100'}`}>
                <Gift className={`h-6 w-6 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Type Filters */}
        <div className={`rounded-xl p-4 mb-4 border ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-wrap gap-2">
            {celebrationTypes.map(type => {
              const Icon = type.icon;
              const isActive = selectedType === type.id;
              const count = type.id === 'all' ? celebrations.length : celebrations.filter(c => c.type === type.id).length;
              return (
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type.id); setCurrentPage(1); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? `${type.color} text-white shadow-md` 
                      : darkMode 
                        ? 'bg-almet-san-juan text-almet-bali-hai hover:bg-almet-comet'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  {type.name}
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    isActive ? 'bg-white/20' : darkMode ? 'bg-almet-comet' : 'bg-gray-200'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Month Filter */}
        <div className={`rounded-xl p-4 mb-4 border ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search celebrations..."
                className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-almet-sapphire outline-none ${
                  darkMode 
                    ? 'border-almet-comet bg-almet-san-juan text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
              className={`px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-almet-sapphire outline-none ${
                darkMode 
                  ? 'border-almet-comet bg-almet-san-juan text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {months.map(month => <option key={month.id} value={month.id}>{month.name}</option>)}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
          </div>
        ) : paginatedCelebrations.length === 0 ? (
          <div className={`rounded-xl p-12 text-center border ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'}`}>
            <PartyPopper className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No Celebrations Found
            </h3>
            <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
              Try adjusting your filters or create a new celebration
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedCelebrations.map((item) => {
                const typeInfo = getTypeInfo(item.type);
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl overflow-hidden border hover:shadow-lg transition-all group relative ${
                      darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div 
                      className="relative h-48 overflow-hidden cursor-pointer" 
                      onClick={() => { 
                        setSelectedCelebration(item); 
                        setCurrentImageIndex(0);
                        setShowDetailModal(true); 
                      }}
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title || item.employee_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.images.length > 1 && (
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                          {item.images.length} photos
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 ${typeInfo.color} text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg`}>
                        <TypeIcon size={12} />
                        {typeInfo.name}
                      </div>
                    </div>

                    {!item.is_auto && (
                      <div className="absolute top-52 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditCelebration(item, e)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCelebration(item, e)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    <div 
                      className="p-4 cursor-pointer" 
                      onClick={() => { 
                        setSelectedCelebration(item); 
                        setCurrentImageIndex(0);
                        setShowDetailModal(true); 
                      }}
                    >
                      <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title || item.employee_name}
                      </h3>
                      {item.position && (
                        <p className={`text-sm mb-2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                          {item.position} 
                        </p>
                      )}
                   
                      {item.years && (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mb-2 ${
                          darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                        }`}>
                          <Award size={12} />
                          {item.years} years
                        </div>
                      )}
                      <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}`}>
                        {item.message}
                      </p>
                      <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? 'border-almet-comet' : 'border-gray-200'}`}>
                        <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                          <Calendar size={12} />
                          {formatDate(item.date)}
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                          <Heart size={12} />
                          {item.wishes} wishes
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-almet-sapphire hover:text-white'
                  } ${darkMode ? 'bg-almet-cloud-burst text-white border border-almet-comet' : 'bg-white text-gray-900 border border-gray-300'}`}
                >
                  Previous
                </button>
                <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-gray-900'}`}>
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-almet-sapphire hover:text-white'
                  } ${darkMode ? 'bg-almet-cloud-burst text-white border border-almet-comet' : 'bg-white text-gray-900 border border-gray-300'}`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <div 
              className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
                darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create Celebration
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-almet-comet' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={20} className={darkMode ? 'text-almet-bali-hai' : 'text-gray-600'} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Celebration Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {celebrationTypes.filter(t => !['all', 'birthday', 'work_anniversary'].includes(t.id)).map(type => {
                      const Icon = type.icon;
                      const isActive = formData.type === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.id })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive 
                              ? `${type.color} text-white shadow-md` 
                              : darkMode 
                                ? 'bg-almet-san-juan text-almet-bali-hai hover:bg-almet-comet'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon size={16} />
                          {type.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter celebration title"
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-almet-sapphire outline-none ${
                      darkMode 
                        ? 'border-almet-comet bg-almet-san-juan text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>

           

                {/* Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-almet-sapphire outline-none ${
                      darkMode 
                        ? 'border-almet-comet bg-almet-san-juan text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter celebration message"
                    rows={4}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-almet-sapphire outline-none resize-none ${
                      darkMode 
                        ? 'border-almet-comet bg-almet-san-juan text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Images
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    darkMode ? 'border-almet-comet bg-almet-san-juan' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <ImageIcon className={`h-12 w-12 mx-auto mb-2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-400'}`} />
                      <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                        Click to upload images
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>
                        PNG, JPG up to 10MB
                      </p>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className={`sticky bottom-0 flex justify-end gap-3 p-6 border-t ${
                darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-almet-san-juan text-white hover:bg-almet-comet' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCelebration}
                  disabled={!formData.title || !formData.date || !formData.message}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !formData.title || !formData.date || !formData.message
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-almet-sapphire text-white hover:bg-blue-700'
                  }`}
                >
                  Create Celebration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCelebration && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <div 
              className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <img
                  src={selectedCelebration.images[currentImageIndex]}
                  alt={selectedCelebration.title || selectedCelebration.employee_name}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Buttons */}
                {selectedCelebration.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg shadow-lg transition-colors ${
                        darkMode ? 'bg-almet-cloud-burst hover:bg-almet-comet' : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft size={20} className={darkMode ? 'text-white' : 'text-gray-600'} />
                    </button>
                    <button
                      onClick={nextImage}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg shadow-lg transition-colors ${
                        darkMode ? 'bg-almet-cloud-burst hover:bg-almet-comet' : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight size={20} className={darkMode ? 'text-white' : 'text-gray-600'} />
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
                      {currentImageIndex + 1} / {selectedCelebration.images.length}
                    </div>
                  </>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`absolute top-4 right-4 p-2 rounded-lg shadow-lg transition-colors ${
                    darkMode ? 'bg-almet-cloud-burst hover:bg-almet-comet' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <X size={20} className={darkMode ? 'text-almet-bali-hai' : 'text-gray-600'} />
                </button>

                {/* Edit and Delete Buttons */}
                {!selectedCelebration.is_auto && (
                  <div className="absolute top-4 left-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        setShowDetailModal(false);
                        handleEditCelebration(selectedCelebration, e);
                      }}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        setShowDetailModal(false);
                        handleDeleteCelebration(selectedCelebration, e);
                      }}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                {/* Type Badge */}
                <div className={`absolute bottom-4 left-4 ${getTypeInfo(selectedCelebration.type).color} text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg`}>
                  {React.createElement(getTypeInfo(selectedCelebration.type).icon, { size: 16 })}
                  {getTypeInfo(selectedCelebration.type).name}
                </div>
              </div>

              <div className="p-6">
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCelebration.title || selectedCelebration.employee_name}
                </h2>
                {selectedCelebration.position && (
                  <p className={`text-sm mb-4 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                    {selectedCelebration.position} 
                  </p>
                )}
               
                {selectedCelebration.years && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-4 ${
                    darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <Award size={16} />
                    {selectedCelebration.years} years
                  </div>
                )}
                
                <div className={`rounded-lg p-4 mb-4 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'}`}>
                  <p className={`leading-relaxed ${darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}`}>
                    {selectedCelebration.message}
                  </p>
                </div>

                <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-almet-comet' : 'border-gray-200'}`}>
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                    <Calendar size={16} />
                    {formatDate(selectedCelebration.date)}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                    <Heart size={16} />
                    {selectedCelebration.wishes} wishes
                  </div>
                </div>

                {/* Add Wish Button */}
                <button
                  onClick={() => setShowWishModal(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-almet-sapphire text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Heart size={18} />
                  Send Your Wishes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wish Modal */}
        {showWishModal && selectedCelebration && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowWishModal(false)}
          >
            <div 
              className={`rounded-xl p-6 max-w-md w-full ${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Send Your Wishes
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                To: {selectedCelebration.title || selectedCelebration.employee_name}
              </p>
              <textarea
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                placeholder="Write your wishes here..."
                rows={4}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-almet-sapphire outline-none resize-none mb-4 ${
                  darkMode 
                    ? 'border-almet-comet bg-almet-san-juan text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowWishModal(false);
                    setWishMessage('');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-almet-san-juan text-white hover:bg-almet-comet' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWish}
                  disabled={!wishMessage.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !wishMessage.trim()
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-almet-sapphire text-white hover:bg-blue-700'
                  }`}
                >
                  Send Wish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal.isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmModal({ isOpen: false, item: null })}
          >
            <div 
              className={`rounded-xl p-6 max-w-md w-full ${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Delete Celebration
              </h3>
              <p className={`mb-6 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                Are you sure you want to delete "{confirmModal.item?.title || confirmModal.item?.employee_name}"?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, item: null })}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-almet-san-juan text-white hover:bg-almet-comet' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}