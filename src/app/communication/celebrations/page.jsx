// src/app/celebrations/page.jsx - Company Celebrations Page (COMPLETE)
"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { 
  Plus, Search, Calendar, Cake, Award, Gift, PartyPopper,
  Edit, Trash2, X, Loader2, TrendingUp
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import ConfirmationModal from '@/components/common/ConfirmationModal';

import { useToast } from '@/components/common/Toast';

export default function CelebrationsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();

  const [celebrations, setCelebrations] = useState([]);
  const [selectedCelebration, setSelectedCelebration] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCelebration, setEditingCelebration] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });

  const celebrationTypes = [
    { id: 'all', name: 'All Celebrations', icon: PartyPopper, color: 'bg-almet-sapphire' },
    { id: 'birthday', name: 'Birthdays', icon: Cake, color: 'bg-pink-500' },
    { id: 'work_anniversary', name: 'Work Anniversary', icon: Award, color: 'bg-purple-500' },
 
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
        { id: 1, type: 'birthday', employeeName: 'Sarah Johnson', employeeId: 'EMP001', position: 'Senior Product Manager', department: 'Product', date: '2024-01-25', imagePreview: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', message: 'Wishing you a fantastic birthday!', wishes: 45 },
        { id: 2, type: 'work_anniversary', employeeName: 'Michael Chen', employeeId: 'EMP002', position: 'Tech Lead', department: 'Engineering', date: '2024-01-28', years: 5, imagePreview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', message: '5 amazing years with us!', wishes: 67 },
        { id: 3, type: 'birthday', employeeName: 'Em ily Rodriguez', employeeId: 'EMP003', position: 'HR Manager', department: 'Human Resources', date: '2024-02-05', imagePreview: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', message: 'Happy Birthday!', wishes: 38 },
      
      ]);
      setLoading(false);
    }, 1000);
  };

  const filteredCelebrations = celebrations.filter(item => {
    const matchesSearch = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesMonth = selectedMonth === 'all' || item.date.split('-')[1] === selectedMonth;
    return matchesSearch && matchesType && matchesMonth;
  });

  const sortedCelebrations = [...filteredCelebrations].sort((a, b) => new Date(a.date) - new Date(b.date));
  const totalPages = Math.ceil(sortedCelebrations.length / itemsPerPage);
  const paginatedCelebrations = sortedCelebrations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const getTypeInfo = (typeId) => celebrationTypes.find(type => type.id === typeId) || celebrationTypes[0];


  const handleEditCelebration = (item, e) => { e.stopPropagation(); setEditingCelebration(item); setShowFormModal(true); };
  
  const handleSaveCelebration = async (formData) => {
    try {
      if (editingCelebration) {
        setCelebrations(prev => prev.map(item => item.id === editingCelebration.id ? { ...item, ...formData } : item));
        showSuccess('Celebration updated successfully');
      } else {
        setCelebrations(prev => [{ ...formData, id: Date.now(), wishes: 0 }, ...prev]);
        showSuccess('Celebration created successfully');
      }
      setShowFormModal(false);
      setEditingCelebration(null);
    } catch (error) {
      showError('Failed to save celebration');
      throw error;
    }
  };

  const handleDeleteCelebration = (item, e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, item }); };
  const confirmDelete = () => { setCelebrations(prev => prev.filter(item => item.id !== confirmModal.item.id)); showSuccess('Deleted'); setConfirmModal({ isOpen: false, item: null }); };

  const upcomingCelebrations = celebrations.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= new Date() && itemDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  });

  return (
    <DashboardLayout>
      <div className="p-4 bg-almet-mystic dark:bg-gray-900 min-h-screen">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Company Celebrations</h1>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Celebrate milestones together</p>
            </div>
        
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 border border-gray-200 dark:border-almet-comet">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-almet-bali-hai mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{celebrations.length}</p>
              </div>
              <div className="p-3 bg-almet-sapphire/10 rounded-lg"><PartyPopper className="h-6 w-6 text-almet-sapphire" /></div>
            </div>
          </div>
          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 border border-gray-200 dark:border-almet-comet">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-almet-bali-hai mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{celebrations.filter(c => c.date.split('-')[1] === new Date().toISOString().split('-')[1]).length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
            </div>
          </div>
          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 border border-gray-200 dark:border-almet-comet">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-almet-bali-hai mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingCelebrations.length}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg"><TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" /></div>
            </div>
          </div>
          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 border border-gray-200 dark:border-almet-comet">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-almet-bali-hai mb-1">Wishes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{celebrations.reduce((sum, item) => sum + item.wishes, 0)}</p>
              </div>
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg"><Gift className="h-6 w-6 text-pink-600 dark:text-pink-400" /></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 mb-4 border border-gray-200 dark:border-almet-comet">
          <div className="flex flex-wrap gap-2">
            {celebrationTypes.map(type => {
              const Icon = type.icon;
              const isActive = selectedType === type.id;
              return (
                <button key={type.id} onClick={() => { setSelectedType(type.id); setCurrentPage(1); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? `${type.color} text-white shadow-md` : 'bg-gray-100 dark:bg-almet-san-juan text-gray-700 dark:text-almet-bali-hai hover:bg-gray-200 dark:hover:bg-almet-comet'}`}>
                  <Icon size={16} />{type.name}
                  {type.id !== 'all' && <span className={`px-1.5 py-0.5 rounded text-xs ${isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-almet-comet'}`}>{celebrations.filter(c => c.type === type.id).length}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 mb-4 border border-gray-200 dark:border-almet-comet">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 text-sm border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire outline-none">
              {months.map(month => <option key={month.id} value={month.id}>{month.name}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" /></div>
        ) : paginatedCelebrations.length === 0 ? (
          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-12 text-center border border-gray-200 dark:border-almet-comet">
            <PartyPopper className="h-16 w-16 text-gray-400 dark:text-almet-bali-hai mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Celebrations Found</h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedCelebrations.map((item) => {
                const typeInfo = getTypeInfo(item.type);
                const TypeIcon = typeInfo.icon;
                return (
                  <div key={item.id} className="bg-white dark:bg-almet-cloud-burst rounded-xl overflow-hidden border border-gray-200 dark:border-almet-comet hover:shadow-lg transition-all group relative">
                    <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => { setSelectedCelebration(item); setShowDetailModal(true); }}>
                      <img src={item.imagePreview} alt={item.employeeName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className={`absolute top-3 right-3 ${typeInfo.color} text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg`}><TypeIcon size={12} />{typeInfo.name}</div>
                    </div>
                    <div className="absolute top-52 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleEditCelebration(item, e)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg" title="Edit"><Edit size={14} /></button>
                      <button onClick={(e) => handleDeleteCelebration(item, e)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg" title="Delete"><Trash2 size={14} /></button>
                    </div>
                    <div className="p-4 cursor-pointer" onClick={() => { setSelectedCelebration(item); setShowDetailModal(true); }}>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.employeeName}</h3>
                      <p className="text-sm text-gray-600 dark:text-almet-bali-hai mb-2">{item.position} • {item.department}</p>
                      {item.years && <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium mb-2"><Award size={12} />{item.years} years</div>}
                    
                      <p className="text-sm text-gray-700 dark:text-almet-bali-hai mb-3 line-clamp-2">{item.message}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-almet-comet">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-almet-bali-hai"><Calendar size={12} />{formatDate(item.date)}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-almet-bali-hai"><Gift size={12} />{item.wishes} wishes</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={sortedCelebrations.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} darkMode={darkMode} />}
          </>
        )}

        {showDetailModal && selectedCelebration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="relative h-64">
                <img src={selectedCelebration.imagePreview} alt={selectedCelebration.employeeName} className="w-full h-full object-cover" />
                <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 p-2 bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"><X size={20} className="text-gray-600 dark:text-almet-bali-hai" /></button>
                <div className="absolute top-4 left-4 flex gap-2">
                  <button onClick={(e) => { setShowDetailModal(false); handleEditCelebration(selectedCelebration, e); }} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg" title="Edit"><Edit size={16} /></button>
                  <button onClick={(e) => { setShowDetailModal(false); handleDeleteCelebration(selectedCelebration, e); }} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg" title="Delete"><Trash2 size={16} /></button>
                </div>
                <div className={`absolute bottom-4 left-4 ${getTypeInfo(selectedCelebration.type).color} text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg`}>{React.createElement(getTypeInfo(selectedCelebration.type).icon, { size: 16 })}{getTypeInfo(selectedCelebration.type).name}</div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedCelebration.employeeName}</h2>
                <p className="text-sm text-gray-600 dark:text-almet-bali-hai mb-4">{selectedCelebration.position} • {selectedCelebration.department}</p>
                {selectedCelebration.years && <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium mb-4"><Award size={16} />{selectedCelebration.years} years</div>}
           
                <div className="bg-gray-50 dark:bg-almet-san-juan rounded-lg p-4 mb-4"><p className="text-gray-700 dark:text-almet-bali-hai leading-relaxed">{selectedCelebration.message}</p></div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-almet-comet">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-almet-bali-hai"><Calendar size={16} />{formatDate(selectedCelebration.date)}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-almet-bali-hai"><Gift size={16} />{selectedCelebration.wishes} wishes</div>
                </div>
              </div>
            </div>
          </div>
        )}

    
        <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, item: null })} onConfirm={confirmDelete} title="Delete Celebration" message={`Delete "${confirmModal.item?.employeeName}"?`} confirmText="Delete" type="danger" darkMode={darkMode} />
      </div>
    </DashboardLayout>
  );
}