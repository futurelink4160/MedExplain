import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 id="dialog-title" className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${variantClasses[variant]}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
