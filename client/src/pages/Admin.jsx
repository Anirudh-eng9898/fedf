import { useEffect, useState } from 'react';
import { adminService } from '../services/services';
import { useNotifications } from '../context/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Skeleton from '../components/Skeleton';
import Modal from '../components/Modal';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });
  const [showBroadcast, setShowBroadcast] = useState(false);
  const { addToast } = useNotifications();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([adminService.getStats(), adminService.getUsers()]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleActive = async (id, currentActive) => {
    try {
      await adminService.updateUser(id, { active: !currentActive });
      addToast(`User ${!currentActive ? 'activated' : 'deactivated'}`, 'success');
      fetchData();
    } catch { addToast('Failed', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteUser(deleteId);
      addToast('User deleted', 'success');
      setDeleteId(null);
      fetchData();
    } catch { addToast('Failed', 'error'); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) { addToast('Fill all fields', 'error'); return; }
    try {
      await adminService.broadcastNotification(broadcastForm);
      addToast('Notification sent!', 'success');
      setShowBroadcast(false);
      setBroadcastForm({ title: '', message: '' });
    } catch { addToast('Failed', 'error'); }
  };

  if (loading) return <div className="space-y-6"><div className="grid grid-cols-4 gap-4"><Skeleton type="card" count={4} /></div><Skeleton type="table" count={5} /></div>;

  const kpis = [
    { label: 'Total Students', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500/20 to-blue-600/20' },
    { label: 'Active Today', value: stats?.activeToday || 0, icon: '🟢', color: 'from-emerald-500/20 to-emerald-600/20' },
    { label: 'Activities Today', value: stats?.totalActivitiesToday || 0, icon: '🏃', color: 'from-purple-500/20 to-purple-600/20' },
    { label: 'Active Challenges', value: stats?.activeChallenges || 0, icon: '🏆', color: 'from-amber-500/20 to-amber-600/20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white">Admin Dashboard</h1><p className="text-gray-400 text-sm">System overview and management</p></div>
        <button onClick={() => setShowBroadcast(!showBroadcast)} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors text-sm">
          📢 Broadcast
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.color} border border-gray-700/30 rounded-2xl p-5`}>
            <span className="text-2xl">{k.icon}</span>
            <p className="text-2xl font-bold text-white mt-2">{k.value}</p>
            <p className="text-sm text-gray-400">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Broadcast Form */}
      {showBroadcast && (
        <form onSubmit={handleBroadcast} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Send Broadcast Notification</h3>
          <input value={broadcastForm.title} onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder="Notification title" aria-label="Notification title" />
          <textarea value={broadcastForm.message} onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            rows={3} placeholder="Message..." aria-label="Message" />
          <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">Send to All Users</button>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead><tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="pb-3 px-4">Name</th><th className="pb-3 px-4">Email</th><th className="pb-3 px-4">Role</th>
              <th className="pb-3 px-4">Status</th><th className="pb-3 px-4">Actions</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-gray-400">{u.email}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-lg text-xs ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{u.role}</span></td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-lg text-xs ${u.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => handleToggleActive(u.id, u.active)} className="text-yellow-400 hover:text-yellow-300 text-xs" aria-label="Toggle active">{u.active ? '🔒' : '🔓'}</button>
                    <button onClick={() => setDeleteId(u.id)} className="text-red-400 hover:text-red-300 text-xs" aria-label="Delete user">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete User" message="Permanently delete this user and all their data?" confirmText="Delete" />
    </div>
  );
};

export default Admin;
