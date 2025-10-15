import { Bell, CheckCheck, Trash2, Clock, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationService from "@/services/notificationService";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [activeTab, isOpen]);

  useEffect(() => {
    // Initial count fetch
    fetchUnreadCount();
    // Poll every 2 minutes
    const interval = setInterval(fetchUnreadCount, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await NotificationService.getUnreadCount('all');
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getOutlookEmails({
        module: activeTab,
        top: 10
      });

      if (data.success) {
        setNotifications(data.emails || []);
        const unread = data.emails?.filter(e => !e.is_read).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId, e) => {
    e.stopPropagation();
    try {
      await NotificationService.markEmailAsRead(messageId);
      setNotifications(prev => 
        prev.map(n => n.id === messageId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllEmailsAsRead(activeTab);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getModuleColor = (module) => {
    switch (module) {
      case 'vacation':
        return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'business_trip':
        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400';
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
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[420px] bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl border border-gray-200 dark:border-almet-comet z-50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2.5 bg-gradient-to-r from-almet-sapphire to-almet-astral">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-white/20 rounded-lg">
                  <Bell size={14} className="text-white" />
                </div>
                <h3 className="text-xs font-bold text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-white/30 backdrop-blur-sm rounded-full text-[10px] font-semibold text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] text-white/90 hover:text-white transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-white/10"
                >
                  <CheckCheck size={10} />
                  Mark all
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5">
              {[
                { key: 'all', label: 'All' },
                { key: 'business_trip', label: 'Trips' },
                { key: 'vacation', label: 'Vacation' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-almet-sapphire shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[450px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-almet-sapphire border-t-transparent"></div>
                <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 dark:bg-almet-comet flex items-center justify-center">
                  <Bell size={20} className="text-gray-400 dark:text-almet-bali-hai" />
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-white mb-0.5">
                  No notifications
                </p>
                <p className="text-[10px] text-gray-500 dark:text-almet-bali-hai">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`px-3 py-2.5 border-b border-gray-100 dark:border-almet-comet last:border-b-0 hover:bg-gray-50 dark:hover:bg-almet-comet/30 transition-all cursor-pointer group ${
                      !notification.is_read ? 'bg-blue-50/30 dark:bg-almet-comet/20' : ''
                    }`}
                    onClick={() => window.location.href = '/notifications'}
                  >
                    <div className="flex gap-2.5">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-base transition-transform group-hover:scale-110 ${
                          getModuleColor(notification.module)
                        }`}>
                          {getModuleIcon(notification.module)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-[11px] font-semibold line-clamp-1 leading-tight ${
                            !notification.is_read 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.subject}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[9px] text-gray-500 dark:text-almet-bali-hai whitespace-nowrap">
                              {getTimeAgo(notification.received_at)}
                            </span>
                            {!notification.is_read && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="p-0.5 rounded-md hover:bg-almet-sapphire/10 dark:hover:bg-almet-sapphire/20 transition-colors opacity-0 group-hover:opacity-100"
                                title="Mark as read"
                              >
                                <CheckCheck size={12} className="text-almet-sapphire" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-[10px] text-gray-600 dark:text-almet-bali-hai line-clamp-2 mb-1.5 leading-relaxed">
                          {notification.preview}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[9px] text-gray-500 dark:text-almet-bali-hai">
                            <span className="flex items-center gap-0.5">
                              <Mail size={9} />
                              <span className="truncate max-w-[120px]">
                                {notification.from_name}
                              </span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {notification.has_attachments && (
                              <span className="text-gray-400 dark:text-almet-bali-hai text-[10px]" title="Has attachments">
                                📎
                              </span>
                            )}
                            {!notification.is_read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-almet-sapphire shadow-lg shadow-almet-sapphire/50"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 dark:border-almet-comet bg-gray-50 dark:bg-almet-comet/20">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/notifications';
                }}
                className="w-full text-[11px] font-medium text-almet-sapphire hover:text-almet-astral dark:text-almet-astral dark:hover:text-almet-sapphire transition-colors py-1.5 rounded-lg hover:bg-almet-sapphire/5 dark:hover:bg-almet-sapphire/10"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;