import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: AlertCircle,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  const Icon = icons[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md ${bgColors[type]}`}>
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColors[type]}`} />
        <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>
          {message}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`flex-shrink-0 ${textColors[type]} hover:opacity-70 transition-opacity`}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ToastManagerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export function ToastManager({ toasts, onRemove }: ToastManagerProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ top: `${1 + index * 5}rem` }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </>
  );
}
