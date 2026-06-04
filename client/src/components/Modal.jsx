const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmColor = 'red' }) => {
  if (!isOpen) return null;

  const colors = {
    red: 'bg-red-600 hover:bg-red-700',
    green: 'bg-emerald-600 hover:bg-emerald-700',
    blue: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors" aria-label="Cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors ${colors[confirmColor]}`} aria-label={confirmText}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
