// src/app/news/page.jsx - Company News Page with Target Groups (Complete)
"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { 
  Plus, Search, Calendar, Eye, Edit, Trash2, TrendingUp, 
  Clock, X, FileText, CheckCircle, Loader2, Pin, PinOff, Users, Target, Mail, Settings
} from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import NewsFormModal from '@/components/news/NewsFormModal';
import { useToast } from '@/components/common/Toast';
import TargetGroupManagement from '@/components/news/TargetGroupManagement';

// Sample Target Groups
const targetGroups = [
  { id: 1, name: 'Leadership Team', memberCount: 15 },
  { id: 2, name: 'Technology Division', memberCount: 45 },
  { id: 3, name: 'Sales Force', memberCount: 32 },
  { id: 4, name: 'Marketing Team', memberCount: 28 },
  { id: 5, name: 'All Employees', memberCount: 250 },
  { id: 6, name: 'Management Team', memberCount: 20 }
];

export default function CompanyNewsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();

  // States
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });
  const [showTargetGroupManagement, setShowTargetGroupManagement] = useState(false);

  // Categories
  const categories = [
    { id: 'all', name: 'All News', icon: FileText, color: 'bg-almet-sapphire' },
    { id: 'announcement', name: 'Announcements', icon: TrendingUp, color: 'bg-blue-500' },
    { id: 'event', name: 'Events', icon: Calendar, color: 'bg-green-500' },
    { id: 'achievement', name: 'Achievements', icon: CheckCircle, color: 'bg-yellow-500' },
    { id: 'update', name: 'Updates', icon: Clock, color: 'bg-purple-500' }
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    setTimeout(() => {
      setNews([
        {
          id: 1,
          title: "Q4 Company Performance Review",
          excerpt: "Exceptional results achieved in Q4 2024 with 25% growth in revenue and expansion into new markets.",
          content: "Our Q4 performance has exceeded all expectations with a remarkable 25% growth in revenue compared to the previous quarter. This success can be attributed to our strategic expansion into the Asian and European markets, as well as the launch of three innovative products that have been well-received by our customers.\n\nKey highlights include:\n- Revenue growth of 25% quarter-over-quarter\n- Successful entry into 5 new international markets\n- Launch of 3 groundbreaking products\n- Team expansion by 40% to support growth\n- Customer satisfaction rating increased to 94%\n\nLooking ahead to 2025, we are positioned stronger than ever to continue this growth trajectory. Our focus will remain on innovation, customer satisfaction, and strategic market expansion.",
          category: 'announcement',
          author: { name: 'CEO Office' },
          publishedAt: '2024-01-15T10:30:00',
          imagePreview: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
          views: 1245,
          isPinned: true,
          tags: ['Performance', 'Growth', 'Q4'],
          targetGroups: [1, 5], // Leadership Team, All Employees
          notifyMembers: true
        },
        {
          id: 2,
          title: "Annual Company Gathering 2024",
          excerpt: "Join us for our biggest company event of the year featuring team building activities and awards ceremony.",
          content: "We are excited to announce our Annual Company Gathering 2024, scheduled for March 15th at the Grand Convention Center. This year's event promises to be our most memorable yet!\n\nEvent Schedule:\n- 9:00 AM: Registration and Welcome Coffee\n- 10:00 AM: CEO Keynote Address\n- 11:00 AM: Team Building Activities\n- 1:00 PM: Lunch and Networking\n- 3:00 PM: Awards Ceremony\n- 5:00 PM: Gala Dinner\n- 7:00 PM: Entertainment and Dancing\n\nDon't miss this opportunity to connect with colleagues, celebrate our achievements, and have fun!",
          category: 'event',
          author: { name: 'HR Department' },
          publishedAt: '2024-01-14T14:20:00',
          imagePreview: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
          views: 892,
          isPinned: false,
          tags: ['Event', 'Team Building'],
          targetGroups: [5], // All Employees
          notifyMembers: true
        },
        {
          id: 3,
          title: "New Office Opening in Dubai",
          excerpt: "Expanding our presence in the Middle East with a state-of-the-art office space in Dubai.",
          content: "We are thrilled to announce the opening of our new regional headquarters in Dubai, UAE. This marks a significant milestone in our Middle Eastern expansion strategy.\n\nOffice Features:\n- 5,000 square meters of modern workspace\n- State-of-the-art technology infrastructure\n- Collaborative spaces and meeting rooms\n- Wellness center and cafeteria\n- Prime location in Dubai Business Bay\n\nThe office will accommodate up to 200 employees and serve as our hub for Middle East operations.",
          category: 'announcement',
          author: { name: 'Operations Team' },
          publishedAt: '2024-01-13T09:15:00',
          imagePreview: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
          views: 2341,
          isPinned: false,
          tags: ['Expansion', 'Office', 'Dubai'],
          targetGroups: [1, 6, 5], // Leadership, Management, All Employees
          notifyMembers: false
        },
        {
          id: 4,
          title: "Employee of the Month - January 2024",
          excerpt: "Congratulations to Sarah Johnson for outstanding performance and dedication to excellence.",
          content: "We are proud to recognize Sarah Johnson as our Employee of the Month for January 2024. Sarah has consistently demonstrated exceptional dedication, innovation, and leadership in her role as Senior Product Manager.\n\nHighlights of Sarah's Contributions:\n- Led the successful launch of our new mobile app\n- Improved team productivity by 30%\n- Mentored 5 junior team members\n- Implemented innovative project management processes\n\nCongratulations Sarah! Your hard work and commitment inspire us all.",
          category: 'achievement',
          author: { name: 'HR Department' },
          publishedAt: '2024-01-12T11:00:00',
          imagePreview: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
          views: 567,
          isPinned: false,
          tags: ['Achievement', 'Recognition', 'Employee'],
          targetGroups: [5], // All Employees
          notifyMembers: true
        },
        {
          id: 5,
          title: "Enhanced Benefits Package 2024",
          excerpt: "We're introducing comprehensive enhancements to employee benefits including health insurance upgrades and wellness programs.",
          content: "Starting February 1st, all employees will benefit from our enhanced benefits package, reflecting our commitment to employee wellbeing and work-life balance.\n\nNew Benefits Include:\n- Premium health insurance with dental and vision\n- Mental health support and counseling services\n- Flexible work arrangements\n- Professional development allowance ($2,000/year)\n- Gym membership reimbursement\n- Extended parental leave (6 months)\n- Annual wellness retreat\n\nYour wellbeing is our priority!",
          category: 'update',
          author: { name: 'HR Department' },
          publishedAt: '2024-01-11T13:45:00',
          imagePreview: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
          views: 1876,
          isPinned: true,
          tags: ['Benefits', 'HR', 'Wellbeing'],
          targetGroups: [5], // All Employees
          notifyMembers: true
        },
        {
          id: 6,
          title: "Tech Innovation Summit 2024",
          excerpt: "Join our innovation team at the annual tech summit to explore AI and automation trends shaping the future.",
          content: "We're hosting our annual Tech Innovation Summit on February 20-21, bringing together industry leaders and innovators to discuss the future of technology.\n\nSummit Highlights:\n- Keynote: The Future of AI in Business\n- Workshop: Implementing Automation\n- Panel: Cybersecurity in 2024\n- Networking sessions with tech leaders\n- Product demonstrations\n- Innovation showcase\n\nRegister now to secure your spot!",
          category: 'event',
          author: { name: 'Tech Team' },
          publishedAt: '2024-01-10T16:30:00',
          imagePreview: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          views: 734,
          isPinned: false,
          tags: ['Technology', 'Innovation', 'AI'],
          targetGroups: [2, 4], // Technology, Marketing
          notifyMembers: false
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  // Əgər Target Group Management açıqsa, onu göstər
  if (showTargetGroupManagement) {
    return <TargetGroupManagement onBack={() => setShowTargetGroupManagement(false)} />;
  }

  // Filter and sort news
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedNews = [...filteredNews].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  // Pagination
  const totalPages = Math.ceil(sortedNews.length / itemsPerPage);
  const paginatedNews = sortedNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  // CRUD Operations
  const handleCreateNews = () => {
    setEditingNews(null);
    setShowFormModal(true);
  };

  const handleEditNews = (item, e) => {
    e.stopPropagation();
    setEditingNews(item);
    setShowFormModal(true);
  };

  const handleSaveNews = async (formData) => {
    try {
      if (editingNews) {
        setNews(prev => prev.map(item => 
          item.id === editingNews.id 
            ? { ...item, ...formData, updatedAt: new Date().toISOString() }
            : item
        ));
        showSuccess('News updated successfully');
      } else {
        const newNews = {
          ...formData,
          id: Date.now(),
          author: { name: 'Current User' },
          publishedAt: new Date().toISOString(),
          views: 0
        };
        setNews(prev => [newNews, ...prev]);
        showSuccess('News created successfully');
      }
      setShowFormModal(false);
      setEditingNews(null);
    } catch (error) {
      showError('Failed to save news');
      throw error;
    }
  };

  const handleDeleteNews = (item, e) => {
    e.stopPropagation();
    setConfirmModal({ isOpen: true, item });
  };

  const confirmDelete = () => {
    setNews(prev => prev.filter(item => item.id !== confirmModal.item.id));
    showSuccess('News deleted successfully');
    setConfirmModal({ isOpen: false, item: null });
  };

  const handleTogglePin = (item, e) => {
    e.stopPropagation();
    setNews(prev => prev.map(newsItem => 
      newsItem.id === item.id 
        ? { ...newsItem, isPinned: !newsItem.isPinned }
        : newsItem
    ));
    showSuccess(item.isPinned ? 'News unpinned' : 'News pinned');
  };

  const getTargetGroupInfo = (groupIds) => {
    if (!groupIds || groupIds.length === 0) return { groups: [], totalMembers: 0 };
    const groups = targetGroups.filter(g => groupIds.includes(g.id));
    const totalMembers = groups.reduce((sum, g) => sum + g.memberCount, 0);
    return { groups, totalMembers };
  };

  return (
    <DashboardLayout>
      <div className="p-4 bg-almet-mystic dark:bg-gray-900 min-h-screen">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Company News
              </h1>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">
                Stay updated with the latest announcements and events
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowTargetGroupManagement(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-almet-cloud-burst border border-gray-300 dark:border-almet-comet text-gray-700 dark:text-almet-bali-hai rounded-lg hover:bg-gray-50 dark:hover:bg-almet-comet transition-colors font-medium text-sm shadow-sm"
              >
                <Users size={18} />
                Manage Target Groups
              </button>
              <button 
                onClick={handleCreateNews}
                className="flex items-center gap-2 px-4 py-2.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors font-medium text-sm shadow-sm"
              >
                <Plus size={18} />
                Create News
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 border border-gray-200 dark:border-almet-comet">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-almet-bali-hai mb-1">Total News</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{news.length}</p>
              </div>
              <div className="p-3 bg-almet-sapphire/10 rounded-lg">
                <FileText className="h-6 w-6 text-almet-sapphire" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 border border-gray-200 dark:border-almet-comet">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-almet-bali-hai mb-1">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {news.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 border border-gray-200 dark:border-almet-comet">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-almet-bali-hai mb-1">Pinned News</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {news.filter(item => item.isPinned).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Pin className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 mb-4 border border-gray-200 dark:border-almet-comet">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? `${category.color} text-white shadow-md`
                      : 'bg-gray-100 dark:bg-almet-san-juan text-gray-700 dark:text-almet-bali-hai hover:bg-gray-200 dark:hover:bg-almet-comet'
                  }`}
                >
                  <Icon size={16} />
                  {category.name}
                  {category.id !== 'all' && (
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-almet-comet'
                    }`}>
                      {news.filter(n => n.category === category.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 mb-4 border border-gray-200 dark:border-almet-comet">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search news..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
          </div>
        ) : paginatedNews.length === 0 ? (
          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-12 text-center border border-gray-200 dark:border-almet-comet">
            <FileText className="h-16 w-16 text-gray-400 dark:text-almet-bali-hai mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No News Found</h3>
            <p className="text-sm text-gray-600 dark:text-almet-bali-hai">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedNews.map((item) => {
                const categoryInfo = getCategoryInfo(item.category);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-almet-cloud-burst rounded-xl overflow-hidden border border-gray-200 dark:border-almet-comet hover:shadow-lg transition-all group relative"
                  >
                    {/* Image */}
                    <div 
                      className="relative h-48 overflow-hidden cursor-pointer"
                      onClick={() => {
                        setSelectedNews(item);
                        setShowNewsModal(true);
                      }}
                    >
                      <img
                        src={item.imagePreview}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.isPinned && (
                        <div className="absolute top-3 left-3 bg-almet-sapphire text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg">
                          <Pin size={12} />
                          Pinned
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 ${categoryInfo.color} text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg`}>
                        <CategoryIcon size={12} />
                        {categoryInfo.name}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-52 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleTogglePin(item, e)}
                        className={`p-2 ${item.isPinned ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors shadow-lg`}
                        title={item.isPinned ? 'Unpin' : 'Pin'}
                      >
                        {item.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                      </button>
                      <button
                        onClick={(e) => handleEditNews(item, e)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteNews(item, e)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Content */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => {
                        setSelectedNews(item);
                        setShowNewsModal(true);
                      }}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-almet-sapphire transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-almet-bali-hai mb-3 line-clamp-2">
                        {item.excerpt}
                      </p>

                      {/* Target Groups */}
                      {item.targetGroups && item.targetGroups.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-almet-bali-hai">
                              <Target size={12} />
                              <span className="font-medium">Sent to:</span>
                            </div>
                            {item.targetGroups.slice(0, 2).map(groupId => {
                              const group = targetGroups.find(g => g.id === groupId);
                              return group ? (
                                <span
                                  key={groupId}
                                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium"
                                >
                                  {group.name}
                                </span>
                              ) : null;
                            })}
                            {item.targetGroups.length > 2 && (
                              <span className="text-xs text-gray-500 dark:text-almet-bali-hai">
                                +{item.targetGroups.length - 2} more
                              </span>
                            )}
                            {item.notifyMembers && (
                              <div className="flex items-center gap-1 ml-auto">
                                <Mail size={12} className="text-green-600 dark:text-green-400" />
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  Notified
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-almet-comet">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-almet-bali-hai">
                          <Calendar size={12} />
                          {formatDate(item.publishedAt)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-almet-bali-hai">
                          <Eye size={12} />
                          {item.views} views
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
                totalItems={sortedNews.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                darkMode={darkMode}
              />
            )}
          </>
        )}

        {/* News Detail Modal */}
        {showNewsModal && selectedNews && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNewsModal(false)}>
            <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="relative h-80">
                <img
                  src={selectedNews.imagePreview}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setShowNewsModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-almet-bali-hai" />
                </button>
                
                {/* Action Buttons in Modal */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <button
                    onClick={(e) => handleTogglePin(selectedNews, e)}
                    className={`p-2 ${selectedNews.isPinned ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors shadow-lg`}
                    title={selectedNews.isPinned ? 'Unpin' : 'Pin'}
                  >
                    {selectedNews.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </button>
                  <button
                    onClick={(e) => {
                      setShowNewsModal(false);
                      handleEditNews(selectedNews, e);
                    }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      setShowNewsModal(false);
                      handleDeleteNews(selectedNews, e);
                    }}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Category Badge */}
                <div className={`absolute bottom-4 left-4 ${getCategoryInfo(selectedNews.category).color} text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg`}>
                  {React.createElement(getCategoryInfo(selectedNews.category).icon, { size: 16 })}
                  {getCategoryInfo(selectedNews.category).name}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-almet-sapphire text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {selectedNews.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedNews.author.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-almet-bali-hai">
                        {formatDate(selectedNews.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-almet-bali-hai">
                    <Eye size={16} />
                    {selectedNews.views} views
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedNews.title}
                </h2>

                <p className="text-gray-700 dark:text-almet-bali-hai leading-relaxed mb-4 whitespace-pre-line">
                  {selectedNews.content}
                </p>

                {/* Target Groups Section */}
                {selectedNews.targetGroups && selectedNews.targetGroups.length > 0 && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-almet-san-juan rounded-lg border border-gray-200 dark:border-almet-comet">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="text-almet-sapphire" size={18} />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Target Groups
                      </h3>
                      {selectedNews.notifyMembers && (
                        <div className="flex items-center gap-1 ml-auto">
                          <Mail size={14} className="text-green-600 dark:text-green-400" />
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Email Sent
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedNews.targetGroups.map(groupId => {
                        const group = targetGroups.find(g => g.id === groupId);
                        return group ? (
                          <div
                            key={groupId}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet"
                          >
                            <Users size={14} className="text-gray-600 dark:text-almet-bali-hai" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {group.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-almet-bali-hai">
                              ({group.memberCount} members)
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-almet-comet">
                      <p className="text-xs text-gray-600 dark:text-almet-bali-hai">
                        Total Recipients: <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedNews.targetGroups.reduce((sum, groupId) => {
                            const group = targetGroups.find(g => g.id === groupId);
                            return sum + (group?.memberCount || 0);
                          }, 0)} employees
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-almet-comet">
                  {selectedNews.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai rounded-lg text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
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