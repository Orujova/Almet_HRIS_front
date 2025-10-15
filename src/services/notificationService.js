import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Token management utility
const TokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("accessToken");
    }
    return null;
  },

  setAccessToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", token);
    }
  },

  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
};

// Axios instance for notification API
const notificationApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
notificationApi.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
notificationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Notification Service
const NotificationService = {
  /**
   * Get notification history with optional filters
   * @param {Object} params - Filter parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.recipient_email - Filter by recipient email
   * @param {string} params.related_model - Filter by related model
   * @param {number} params.days - Last N days
   * @returns {Promise} Notification history data
   */
  getNotificationHistory: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.recipient_email) queryParams.append('recipient_email', params.recipient_email);
      if (params.related_model) queryParams.append('related_model', params.related_model);
      if (params.days) queryParams.append('days', params.days);

      const response = await notificationApi.get(
        `/notifications/history/?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notification history:', error);
      throw error;
    }
  },

  /**
   * Get Outlook emails filtered by module
   * @param {Object} params - Filter parameters
   * @param {string} params.module - Filter by module: 'business_trip', 'vacation', or 'all'
   * @param {number} params.top - Number of emails to retrieve (max 50)
   * @returns {Promise} Outlook emails data
   */
  getOutlookEmails: async (params = { module: 'all', top: 50 }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.module) queryParams.append('module', params.module);
      if (params.top) queryParams.append('top', Math.min(params.top, 50));

      const response = await notificationApi.get(
        `/notifications/outlook/emails/?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching Outlook emails:', error);
      throw error;
    }
  },

  /**
   * Mark a specific email as read
   * @param {string} messageId - Email message ID
   * @returns {Promise} Success response
   */
  markEmailAsRead: async (messageId) => {
    try {
      const response = await notificationApi.post(
        '/notifications/outlook/mark-read/',
        { message_id: messageId }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  },

  /**
   * Mark a specific email as unread
   * @param {string} messageId - Email message ID
   * @returns {Promise} Success response
   */
  markEmailAsUnread: async (messageId) => {
    try {
      const response = await notificationApi.post(
        '/notifications/outlook/mark-unread/',
        { message_id: messageId }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking email as unread:', error);
      throw error;
    }
  },

  /**
   * Mark all emails as read by module
   * @param {string} module - Module name: 'business_trip', 'vacation', or 'all'
   * @returns {Promise} Batch result
   */
  markAllEmailsAsRead: async (module = 'all') => {
    try {
      const response = await notificationApi.post(
        '/notifications/outlook/mark-all-read/',
        { module }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all emails as read:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @param {string} module - Optional module filter
   * @returns {Promise<number>} Unread count
   */
  getUnreadCount: async (module = 'all') => {
    try {
      const response = await notificationApi.get(
        `/notifications/outlook/emails/?module=${module}&top=50`
      );
      
      if (response.data.success && response.data.emails) {
        return response.data.emails.filter(email => !email.is_read).length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  /**
   * Get notification statistics
   * @returns {Promise} Notification statistics
   */
  getNotificationStats: async () => {
    try {
      const [history, emails] = await Promise.all([
        NotificationService.getNotificationHistory({ days: 7 }),
        NotificationService.getOutlookEmails({ module: 'all', top: 50 })
      ]);

      const failedCount = history.notifications?.filter(
        n => n.status === 'FAILED'
      ).length || 0;

      const unreadCount = emails.emails?.filter(
        e => !e.is_read
      ).length || 0;

      return {
        totalNotifications: history.count || 0,
        failedNotifications: failedCount,
        unreadEmails: unreadCount,
        totalEmails: emails.count || 0
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
};

export default NotificationService;