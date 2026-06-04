import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/activity', label: 'Activity', icon: '🏃' },
  { path: '/sleep', label: 'Sleep', icon: '😴' },
  { path: '/hydration', label: 'Hydration', icon: '💧' },
  { path: '/wellness', label: 'Wellness', icon: '💚' },
  { path: '/goals', label: 'Goals', icon: '🎯' },
  { path: '/progress', label: 'Progress', icon: '📊' },
  { path: '/challenges', label: 'Challenges', icon: '🏆' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/history', label: 'History', icon: '📜' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const adminItems = [
  { path: '/admin', label: 'Admin Home', icon: '⚙️' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/reports', label: 'Reports', icon: '📈' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose}></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-950 border-r border-gray-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-lg font-bold text-gray-900">
              W
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">Wellness Tracker</h1>
              <p className="text-gray-500 text-xs">Student Health</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">Main Menu</p>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} className={linkClasses} onClick={onClose} aria-label={item.label}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-gray-800"></div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">Admin</p>
              {adminItems.map(item => (
                <NavLink key={item.path} to={item.path} className={linkClasses} onClick={onClose} aria-label={item.label}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">© 2024 Wellness Tracker</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
