import { useNotifications } from '../context/NotificationContext';

const Toast = () => {
  const { toasts } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm" role="alert" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-slide-in backdrop-blur-xl border transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              : toast.type === 'error'
              ? 'bg-red-500/20 border-red-500/30 text-red-300'
              : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toast;
