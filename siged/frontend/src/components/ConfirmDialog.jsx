import Modal from './Modal';

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  danger = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-6">
        <p className="text-gray-600 text-[15px]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg text-white font-bold text-sm transition-colors ${
              danger ? 'bg-danger hover:brightness-90' : 'bg-primary hover:brightness-90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
