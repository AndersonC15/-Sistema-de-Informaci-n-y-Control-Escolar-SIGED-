import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-surface rounded-lg shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-2xl text-gray-500">close</span>
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
