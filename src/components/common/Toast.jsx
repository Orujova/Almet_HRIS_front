import React, { useState, useEffect, createContext, useContext } from 'react';

// Toast Context
const ToastContext = createContext();

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    // Helper functions
    showSuccess: (message, duration = 4000) => addToast(message, 'success', duration),
    showError: (message, duration = 6000) => addToast(message, 'error', duration),
    showWarning: (message, duration = 5000) => addToast(message, 'warning', duration),
    showInfo: (message, duration = 4000) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Container Component
const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Progress bar animation
    if (toast.duration > 0) {
      const interval = 100;
      const steps = toast.duration / interval;
      const progressStep = 100 / steps;
      
      let currentProgress = 100;
      const progressInterval = setInterval(() => {
        currentProgress -= progressStep;
        setProgress(Math.max(0, currentProgress));
        
        if (currentProgress <= 0) {
          clearInterval(progressInterval);
        }
      }, interval);

      return () => {
        clearTimeout(showTimer);
        clearInterval(progressInterval);
      };
    }

    return () => clearTimeout(showTimer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => removeToast(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-xl shadow-2xl border backdrop-blur-sm p-4 transition-all duration-500 ease-out transform pointer-events-auto";
    
    const visibilityStyles = isVisible 
      ? "translate-x-0 opacity-100 scale-100" 
      : "translate-x-full opacity-0 scale-95";

    const typeStyles = {
      success: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-900 shadow-emerald-200/50",
      error: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-900 shadow-red-200/50",
      warning: "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-900 shadow-amber-200/50",
      info: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-900 shadow-blue-200/50"
    };

    return `${baseStyles} ${visibilityStyles} ${typeStyles[toast.type] || typeStyles.info}`;
  };

  const getIcon = () => {
    const iconStyles = "w-6 h-6 mr-3 flex-shrink-0";
    
    switch (toast.type) {
      case 'success':
        return (
          <div className="bg-emerald-100 rounded-full p-1">
            <svg className={`${iconStyles} text-emerald-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-100 rounded-full p-1">
            <svg className={`${iconStyles} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="bg-amber-100 rounded-full p-1">
            <svg className={`${iconStyles} text-amber-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-blue-100 rounded-full p-1">
            <svg className={`${iconStyles} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getProgressBarColor = () => {
    const colors = {
      success: "bg-gradient-to-r from-emerald-400 to-green-500",
      error: "bg-gradient-to-r from-red-400 to-rose-500", 
      warning: "bg-gradient-to-r from-amber-400 to-yellow-500",
      info: "bg-gradient-to-r from-blue-400 to-indigo-500"
    };
    return colors[toast.type] || colors.info;
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-sm font-medium leading-relaxed break-words">
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-black hover:bg-opacity-5 transition-all duration-200 group"
          aria-label="Bağla"
        >
          <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Progress Bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-5">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${getProgressBarColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};