import { useNotifications } from '../context/NotificationContext';
import EmptyState from '../components/EmptyState';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const typeIcons = { challenge: '🏆', reminder: '⏰', goal: '🎯', system: '📢' };
  const typeColors = { challenge: 'border-amber-500/30 bg-amber-500/10', reminder: 'border-blue-500/30 bg-blue-500/10', goal: 'border-emerald-500/30 bg-emerald-500/10', system: 'border-purple-500/30 bg-purple-500/10' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 text-sm">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors text-sm">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" message="You're all caught up!" />
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id}
              onClick={() => !n.read && markAsRead(n.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${n.read ? 'bg-gray-900/30 border-gray-800 opacity-60' : typeColors[n.type] || 'border-gray-700 bg-gray-800/50'}`}
              role="button" aria-label={`Notification: ${n.title}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{typeIcons[n.type] || '📋'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-600 mt-2">{new Date(n.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
