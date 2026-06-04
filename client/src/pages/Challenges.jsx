import { useEffect, useState } from 'react';
import { challengesService } from '../services/services';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', metric: 'steps', targetValue: '', durationDays: '7', invitees: '' });
  const [errors, setErrors] = useState({});
  const { addToast } = useNotifications();
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try { const res = await challengesService.getAll(); setChallenges(res.data.data); }
    catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.targetValue || parseInt(form.targetValue) < 1) e.targetValue = 'Must be positive';
    if (!form.durationDays || parseInt(form.durationDays) < 1) e.durationDays = 'Must be 1-90';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const invitees = form.invitees.split(',').map(s => s.trim()).filter(Boolean);
      await challengesService.create({ ...form, targetValue: parseInt(form.targetValue), durationDays: parseInt(form.durationDays), invitees });
      addToast('Challenge created!', 'success');
      setShowForm(false);
      setForm({ title: '', metric: 'steps', targetValue: '', durationDays: '7', invitees: '' });
      fetchData();
    } catch (err) { addToast('Failed', 'error'); }
  };

  const handleAccept = async (id) => {
    try { await challengesService.accept(id); addToast('Challenge accepted!', 'success'); fetchData(); }
    catch { addToast('Failed', 'error'); }
  };

  const handleDecline = async (id) => {
    try { await challengesService.decline(id); addToast('Challenge declined', 'info'); fetchData(); }
    catch { addToast('Failed', 'error'); }
  };

  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h left`;
  };

  const inputCls = (f) => `w-full px-4 py-3 bg-gray-800 border ${errors[f] ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`;

  if (loading) return <Skeleton type="card" count={3} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white">Peer Challenges</h1><p className="text-gray-400 text-sm">Compete with friends</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors">
          {showForm ? 'Cancel' : '+ Create Challenge'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls('title')} placeholder="7-Day Step Challenge" aria-label="Title" />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Metric</label>
              <select value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })} className={inputCls('metric')} aria-label="Metric">
                <option value="steps">Steps</option><option value="activity">Activity (min)</option>
                <option value="sleep">Sleep (hrs)</option><option value="hydration">Hydration (ml)</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Target Value</label>
              <input type="number" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} className={inputCls('targetValue')} placeholder="50000" aria-label="Target value" />
              {errors.targetValue && <p className="mt-1 text-xs text-red-400">{errors.targetValue}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Duration (days)</label>
              <input type="number" value={form.durationDays} onChange={e => setForm({ ...form, durationDays: e.target.value })} className={inputCls('durationDays')} aria-label="Duration" />
              {errors.durationDays && <p className="mt-1 text-xs text-red-400">{errors.durationDays}</p>}</div>
          </div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Invite (comma-separated emails)</label>
            <input value={form.invitees} onChange={e => setForm({ ...form, invitees: e.target.value })} className={inputCls('invitees')} placeholder="friend@email.com, other@email.com" aria-label="Invitees" /></div>
          <button type="submit" className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors">Create Challenge</button>
        </form>
      )}

      {challenges.length === 0 ? (
        <EmptyState icon="🏆" title="No challenges" message="Create one or wait for an invite!" actionLabel="Create Challenge" onAction={() => setShowForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map(ch => {
            const myParticipant = ch.participants.find(p => p.userId === user?.id);
            const isPending = myParticipant?.status === 'pending';
            return (
              <div key={ch.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${ch.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-400'}`}>{ch.status}</span>
                  <span className="text-xs text-gray-500">{getTimeLeft(ch.endDate)}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{ch.title}</h3>
                <p className="text-sm text-gray-400 mb-4">📊 {ch.metric} · Target: {ch.targetValue} · by {ch.creatorName}</p>

                {/* Leaderboard */}
                <div className="space-y-2 mb-4">
                  {ch.participants.filter(p => p.status === 'accepted').map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">#{i + 1}</span>
                        <span className="text-sm text-gray-300">{p.name}</span>
                      </div>
                      <span className="text-sm font-medium text-amber-400">{p.progress}%</span>
                    </div>
                  ))}
                </div>

                {isPending && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(ch.id)} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">Accept</button>
                    <button onClick={() => handleDecline(ch.id)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-colors">Decline</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Challenges;
