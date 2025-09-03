'use client';
import React, {  useEffect, } from 'react';
import { 
 CheckCircle,
  X, 
} from 'lucide-react';
const SuccessToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-2xl z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-green-800 font-bold text-sm">Success!</h4>
          <p className="text-green-700 text-sm mt-1">{message}</p>
        </div>
        <button onClick={onClose} className="text-green-600 hover:text-green-800">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SuccessToast