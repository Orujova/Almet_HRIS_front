"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { 
  Plus, Search, Calendar, Cake, Award, Gift, PartyPopper,
  Edit, Trash2, X, Loader2, TrendingUp, ChevronLeft, ChevronRight,
  Building2, Briefcase
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
    { id: '01', name: 'January' }, { id: '02', name: 'February' }, { id: '03', name: 'March' },
    { id: '04', name: 'April' }, { id: '05', name: 'May' }, { id: '06', name: 'June' },
    { id: '07', name: 'July' }, { id: '08', name: 'August' }, { id: '09', name: 'September' },
    { id: '10', name: 'October' }, { id: '11', name: 'November' }, { id: '12', name: 'December' }
  ];

  useEffect(() => { loadCelebrations(); }, []);

  const loadCelebrations = async () => {
    setLoading(true);
    setTimeout(() => {
      setCelebrations([
        {
          id: 1,
          type: 'achievement',
          title: 'Almet Academy Graduation',
          employeeName: 'Almet Academy Graduates',
          department: 'All Departments',
          date: '2024-10-15',
          images: [
            '/6.png',
        
          ],
          message: 'We\'re proud to announce that our ALMETers have successfully completed the Almet Academy program and have now commenced their full-time careers at Almet Holding. Throughout their time at Almet Academy, the interns engaged in a structured development journey focused on international markets, trading strategies, and industry practices.',
          wishes: 89
        },
        {
          id: 2,
          type: 'company_event',
          title: 'Halloween Celebration',
          employeeName: 'Almet Team',
          department: 'All Departments',
          date: '2024-10-31',
          images: [
            '/hol2.jpeg',
            '/hol1.jpeg',
         
          ],
          message: 'Today our office turned into a place full of creativity, laughter, and spooky fun! From clever costumes to festive decorations, we embraced the Halloween spirit together. At Almet Holding, we believe that celebrating moments like these strengthens our culture and boosts connection.',
          wishes: 124
        },
        {
          id: 3,
          type: 'company_event',
          title: 'Caspian Construction Week 2025',
          employeeName: 'Almet Holding',
          department: 'Sales & Marketing',
          date: '2024-10-14',
          images: [
            '/Caspian.png',
           
          ],
          message: 'We\'re thrilled to share that the first day of Caspian Construction Week 2025 has been a great success! It\'s been an incredible start at the Baku Expo Center, where we\'ve had the opportunity to showcase our expertise in international steel trading and production.',
          wishes: 156
        },
        {
          id: 4,
          type: 'birthday',
          title: 'Birthday Celebration',
          employeeName: 'Sevinj Asgarova',
          position: 'HR Specialist',
          department: 'Human Resources',
          date: '2024-10-28',
          images: [
            'https://www.sugar.org/wp-content/uploads/Birthday-Cake-1.png'
          ],
          message: 'Wishing you a wonderful birthday filled with joy and happiness! Thank you for all your contributions to the team.',
          wishes: 67
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const filteredCelebrations = celebrations.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesMonth = selectedMonth === 'all' || item.date.split('-')[1] === selectedMonth;
    return matchesSearch && matchesType && matchesMonth;
  });

  const sortedCelebrations = [...filteredCelebrations].sort((a, b) => new Date(a.date) - new Date(b.date));
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
    alert('Edit functionality - To be implemented');
  };

  const handleDeleteCelebration = (item, e) => { 
    e.stopPropagation(); 
    setConfirmModal({ isOpen: true, item }); 
  };

  const confirmDelete = () => { 
    setCelebrations(prev => prev.filter(item => item.id !== confirmModal.item.id)); 
    setConfirmModal({ isOpen: false, item: null }); 
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

  const upcomingCelebrations = celebrations.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= new Date() && itemDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  });

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
        
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-xl p-4 border ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs mb-1 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>Total</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{celebrations.length}</p>
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
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {celebrations.filter(c => c.date.split('-')[1] === new Date().toISOString().split('-')[1]).length}
              </p>
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
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{upcomingCelebrations.length}</p>
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
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {celebrations.reduce((sum, item) => sum + item.wishes, 0)}
              </p>
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
                {type.id !== 'all' && (
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    isActive ? 'bg-white/20' : darkMode ? 'bg-almet-comet' : 'bg-gray-200'
                  }`}>
                    {celebrations.filter(c => c.type === type.id).length}
                  </span>
                )}
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
              placeholder="Search..."
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
                      alt={item.title || item.employeeName}
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

                  <div 
                    className="p-4 cursor-pointer" 
                    onClick={() => { 
                      setSelectedCelebration(item); 
                      setCurrentImageIndex(0);
                      setShowDetailModal(true); 
                    }}
                  >
                    <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.title || item.employeeName}
                    </h3>
                    {item.position && (
                      <p className={`text-sm mb-2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                        {item.position} • {item.department}
                      </p>
                    )}
                    {!item.position && (
                      <p className={`text-sm mb-2 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                        {item.department}
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
                        <Gift size={12} />
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
                alt={selectedCelebration.title || selectedCelebration.employeeName}
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

              {/* Type Badge */}
              <div className={`absolute bottom-4 left-4 ${getTypeInfo(selectedCelebration.type).color} text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg`}>
                {React.createElement(getTypeInfo(selectedCelebration.type).icon, { size: 16 })}
                {getTypeInfo(selectedCelebration.type).name}
              </div>
            </div>

            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedCelebration.title || selectedCelebration.employeeName}
              </h2>
              {selectedCelebration.position && (
                <p className={`text-sm mb-4 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                  {selectedCelebration.position} • {selectedCelebration.department}
                </p>
              )}
              {!selectedCelebration.position && (
                <p className={`text-sm mb-4 ${darkMode ? 'text-almet-bali-hai' : 'text-gray-600'}`}>
                  {selectedCelebration.department}
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
                  <Gift size={16} />
                  {selectedCelebration.wishes} wishes
                </div>
              </div>
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
              Are you sure you want to delete "{confirmModal.item?.title || confirmModal.item?.employeeName}"?
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