import { useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

const iconMap = {
  success: <CheckCircle size={20} style={{ color: 'var(--success)' }} />,
  error:   <AlertCircle size={20} style={{ color: 'var(--error)' }} />,
  warning: <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />,
};

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{iconMap[toast.type]}</span>
          <span className="toast-message">{toast.message}</span>
          <button 
            className="btn-icon" 
            onClick={() => onRemove(toast.id)} 
            style={{ padding: '0.25rem', background: 'none' }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
