import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800" role="banner">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Left: Menu toggle */}
        <button onClick={onMenuToggle} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors" aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all" aria-label="Search" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-800" aria-label="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')} className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-800" aria-label="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-800 transition-colors" aria-label="User menu">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-gray-900">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm text-gray-300 font-medium">{user?.name}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 animate-scale-in">
                <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors">Profile</button>
                <button onClick={() => { navigate('/goals'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors">Settings</button>
                <div className="border-t border-gray-700 my-1"></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
