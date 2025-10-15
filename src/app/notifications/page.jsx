// src/app/notifications/page.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Mail, 
  Clock, 
  Filter,
  Search,
  RefreshCw,
  Archive,
  Star,
  MoreVertical,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import NotificationService from "@/services/notificationService";
import { useTheme } from "@/components/common/ThemeProvider";

const NotificationsPage = () => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all, unread, read
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0
  });

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  useEffect(() => {
    updateStats();
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getOutlookEmails({
        module: activeTab,
        top: 50
      });

      if (data.success) {
        setNotifications(data.emails || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    const unread = notifications.filter(n => !n.is_read).length;
    const read = notifications.filter(n => n.is_read).length;
    setStats({
      total: notifications.length,
      unread,
      read
    });
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await NotificationService.markEmailAsRead(messageId);
      setNotifications(prev => 
        prev.map(n => n.id === messageId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAsUnread = async (messageId) => {
    try {
      await NotificationService.markEmailAsUnread(messageId);
      setNotifications(prev => 
        prev.map(n => n.id === messageId ? { ...n, is_read: false } : n)
      );
    } catch (error) {
      console.error('Error marking as unread:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllEmailsAsRead(activeTab);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      const promises = Array.from(selectedNotifications).map(id => 
        NotificationService.markEmailAsRead(id)
      );
      await Promise.all(promises);
      
      setNotifications(prev => 
        prev.map(n => selectedNotifications.has(n.id) ? { ...n, is_read: true } : n)
      );
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error in bulk mark as read:', error);
    }
  };

  const toggleSelectNotification = (id) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const getModuleColor = (module) => {
    switch (module) {
      case 'vacation':
        return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20';
      case 'business_trip':
        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getModuleIcon = (module) => {
    switch (module) {
      case 'vacation': return '🏖️';
      case 'business_trip': return '✈️';
      default: return '📧';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read/unread status
    if (filterType === 'unread' && notification.is_read) return false;
    if (filterType === 'read' && !notification.is_read) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.subject?.toLowerCase().includes(query) ||
        notification.preview?.toLowerCase().includes(query) ||
        notification.from_name?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-almet-cloud-burst">
      {/* Header */}
      <div className="bg-white dark:bg-almet-cloud-burst border-b border-gray-200 dark:border-almet-comet sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl shadow-lg">
                <Bell size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-sm text-gray-500 dark:text-almet-bali-hai">
                  Manage all your notifications in one place
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                className="p-2.5 rounded-lg bg-white dark:bg-almet-comet border border-gray-200 dark:border-almet-comet text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-almet-comet/80 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2.5 rounded-lg bg-almet-sapphire hover:bg-almet-astral text-white font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <CheckCheck size={16} />
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                    Total Notifications
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Bell size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                    Unread
                  </p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {stats.unread}
                  </p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <Mail size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                    Read
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.read}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCheck size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="flex items-center justify-between">
            {/* Module Tabs */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Notifications', icon: '📬' },
                { key: 'business_trip', label: 'Business Trips', icon: '✈️' },
                { key: 'vacation', label: 'Vacation', icon: '🏖️' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.key
                      ? 'bg-almet-sapphire text-white shadow-lg shadow-almet-sapphire/30'
                      : 'bg-white dark:bg-almet-comet text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-almet-comet/80 border border-gray-200 dark:border-almet-comet'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-almet-bali-hai" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white dark:bg-almet-comet border border-gray-200 dark:border-almet-comet rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 focus:ring-almet-sapphire w-64"
                />
              </div>

              <div className="flex gap-1 p-1 bg-white dark:bg-almet-comet border border-gray-200 dark:border-almet-comet rounded-lg">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'read', label: 'Read' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      filterType === filter.key
                        ? 'bg-almet-sapphire text-white'
                        : 'text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.size > 0 && (
            <div className="mt-4 p-3 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 border border-almet-sapphire/30 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-almet-sapphire dark:text-almet-astral">
                {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="px-3 py-1.5 rounded-lg bg-almet-sapphire hover:bg-almet-astral text-white text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Mark as Read
                </button>
                <button
                  onClick={() => setSelectedNotifications(new Set())}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-almet-comet border border-gray-200 dark:border-almet-comet text-gray-600 dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-almet-comet/80 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-almet-sapphire border-t-transparent mb-4"></div>
            <p className="text-gray-500 dark:text-almet-bali-hai">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl border border-gray-200 dark:border-almet-comet p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-almet-comet flex items-center justify-center">
              <Bell size={40} className="text-gray-400 dark:text-almet-bali-hai" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 dark:text-almet-bali-hai mb-6">
              {searchQuery 
                ? "Try adjusting your search or filters" 
                : "You're all caught up! No new notifications."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg font-medium transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All */}
            <div className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet p-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-white">
                Select All ({filteredNotifications.length})
              </span>
            </div>

            {/* Notification Items */}
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-almet-cloud-burst rounded-xl border transition-all hover:shadow-lg group ${
                  !notification.is_read 
                    ? 'border-almet-sapphire/30 shadow-md shadow-almet-sapphire/10' 
                    : 'border-gray-200 dark:border-almet-comet'
                }`}
              >
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleSelectNotification(notification.id)}
                        className="w-4 h-4 rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire cursor-pointer"
                      />
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl border transition-transform group-hover:scale-110 ${
                        getModuleColor(notification.module)
                      }`}>
                        {getModuleIcon(notification.module)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-base font-semibold mb-1 ${
                            !notification.is_read 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.subject}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-almet-bali-hai">
                            <span className="flex items-center gap-1">
                              <Mail size={12} />
                              {notification.from_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {getTimeAgo(notification.received_at)}
                            </span>
                            {notification.has_attachments && (
                              <span className="flex items-center gap-1">
                                📎 Attachment
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.is_read ? (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-almet-comet text-gray-600 dark:text-white transition-colors opacity-0 group-hover:opacity-100"
                              title="Mark as read"
                            >
                              <Eye size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsUnread(notification.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-almet-comet text-gray-600 dark:text-white transition-colors opacity-0 group-hover:opacity-100"
                              title="Mark as unread"
                            >
                              <EyeOff size={16} />
                            </button>
                          )}
                          
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-almet-sapphire shadow-lg shadow-almet-sapphire/50"></div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-almet-bali-hai leading-relaxed mb-3">
                        {notification.preview}
                      </p>

                      {/* Module Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          getModuleColor(notification.module)
                        }`}>
                          {notification.module === 'business_trip' ? 'Business Trip' : 
                           notification.module === 'vacation' ? 'Vacation' : 'General'}
                        </span>
                        
                        <span className={`text-xs font-medium ${
                          notification.importance === 'high' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-500 dark:text-almet-bali-hai'
                        }`}>
                          {notification.importance === 'high' && '⚠️ High Priority'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && filteredNotifications.length > 0 && filteredNotifications.length < stats.total && (
          <div className="mt-6 text-center">
            <button
              onClick={fetchNotifications}
              className="px-6 py-3 bg-white dark:bg-almet-comet border border-gray-200 dark:border-almet-comet rounded-lg text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-almet-comet/80 transition-colors"
            >
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;