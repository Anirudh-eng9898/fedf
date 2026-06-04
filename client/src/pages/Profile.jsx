import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>

      {/* Profile Card */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-4xl font-bold text-gray-900 mx-auto mb-4">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <h2 className="text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-gray-400">{user?.email}</p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{user?.role}</span>
      </div>

      {/* Settings */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Settings</h3>

        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
          <div><p className="text-white font-medium">Dark Mode</p><p className="text-gray-400 text-sm">Toggle dark/light theme</p></div>
          <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-emerald-500' : 'bg-gray-600'} relative`} aria-label="Toggle dark mode">
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isDark ? 'left-6' : 'left-0.5'}`}></span>
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
          <div><p className="text-white font-medium">Account Created</p><p className="text-gray-400 text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p></div>
        </div>
      </div>

      <button onClick={logout} className="w-full py-3 bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 rounded-xl font-medium transition-colors">
        Logout
      </button>
    </div>
  );
};

export default Profile;
