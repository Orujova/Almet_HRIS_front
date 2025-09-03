
import { 
   AlertCircle, X
} from 'lucide-react';

const ErrorToast = ({ error, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-2xl z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-red-800 font-bold text-sm">Error</h4>
          <p className="text-red-700 text-sm mt-1">{error.message}</p>
        </div>
        <button onClick={onClose} className="text-red-600 hover:text-red-800">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
export default ErrorToast