const EmptyState = ({ icon = '📋', title = 'No data yet', message = 'Start by adding your first entry.', actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm mb-6">{message}</p>
      {actionLabel && (
        <button onClick={onAction} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors" aria-label={actionLabel}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
