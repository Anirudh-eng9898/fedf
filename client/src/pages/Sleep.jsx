import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSleep, createSleep, updateSleep, removeSleep } from '../store/sleepSlice';
import { useNotifications } from '../context/NotificationContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { getToday, formatDate, getSleepColor, getDaysAgo } from '../utils/helpers';

const Sleep = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.sleep);
  const { addToast } = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ bedtime: '22:30', wakeTime: '06:30', quality: '3', date: getToday(), notes: '' });
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { dispatch(fetchSleep({ from: getDaysAgo(30), limit: 100 })); }, [dispatch]);

  const validate = () => {
    const e = {};
    if (!form.bedtime) e.bedtime = 'Required';
    if (!form.wakeTime) e.wakeTime = 'Required';
    if (!form.quality || parseInt(form.quality) < 1 || parseInt(form.quality) > 5) e.quality = 'Must be 1-5';
    if (!form.date) e.date = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const data = { ...form, quality: parseInt(form.quality) };
      if (editId) {
        await dispatch(updateSleep({ id: editId, data })).unwrap();
        addToast('Sleep entry updated!', 'success');
      } else {
        await dispatch(createSleep(data)).unwrap();
        addToast('Sleep logged!', 'success');
      }
      setShowForm(false); setEditId(null);
      setForm({ bedtime: '22:30', wakeTime: '06:30', quality: '3', date: getToday(), notes: '' });
      dispatch(fetchSleep({ from: getDaysAgo(30), limit: 100 }));
    } catch (err) { addToast(err || 'Failed', 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ bedtime: item.bedtime, wakeTime: item.wakeTime, quality: item.quality.toString(), date: item.date, notes: item.notes || '' });
    setEditId(item.id); setShowForm(true);
  };

  const handleDelete = async () => {
    try { await dispatch(removeSleep(deleteId)).unwrap(); addToast('Deleted', 'success'); setDeleteId(null); }
    catch (err) { addToast(err || 'Failed', 'error'); }
  };

  // 7-day trend data
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const d = getDaysAgo(i);
    const entry = items.find(s => s.date === d);
    trendData.push({
      day: new Date(d).toLocaleDateString('en', { weekday: 'short' }),
      hours: entry ? entry.duration : 0,
      quality: entry ? entry.quality : 0
    });
  }

  const inputCls = (field) => `w-full px-4 py-3 bg-gray-800 border ${errors[field] ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white">Sleep Tracker</h1><p className="text-gray-400 text-sm">Monitor your sleep patterns</p></div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); }} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
          {showForm ? 'Cancel' : '+ Log Sleep'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Bedtime</label>
              <input type="time" value={form.bedtime} onChange={e => setForm({ ...form, bedtime: e.target.value })} className={inputCls('bedtime')} aria-label="Bedtime" />
              {errors.bedtime && <p className="mt-1 text-xs text-red-400">{errors.bedtime}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Wake Time</label>
              <input type="time" value={form.wakeTime} onChange={e => setForm({ ...form, wakeTime: e.target.value })} className={inputCls('wakeTime')} aria-label="Wake time" />
              {errors.wakeTime && <p className="mt-1 text-xs text-red-400">{errors.wakeTime}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Quality (1-5 ⭐)</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, quality: n.toString() })}
                    className={`w-10 h-10 rounded-xl text-lg transition-all ${parseInt(form.quality) >= n ? 'bg-yellow-500/30 text-yellow-400' : 'bg-gray-800 text-gray-600'}`}>⭐</button>
                ))}
              </div>
              {errors.quality && <p className="mt-1 text-xs text-red-400">{errors.quality}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls('date')} aria-label="Date" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls('notes')} rows={2} placeholder="How did you sleep?" aria-label="Notes" /></div>
          <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">{editId ? 'Update' : 'Save'}</button>
        </form>
      )}

      {/* 7-day Trend Chart */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">7-Day Sleep Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
            <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Hours" />
            <Line type="monotone" dataKey="quality" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Quality" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* List */}
      {loading ? <Skeleton type="table" count={5} /> : items.length === 0 ? (
        <EmptyState icon="😴" title="No sleep data" message="Log your sleep to see trends" actionLabel="Log Sleep" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-3">
          {items.slice(0, 10).map(item => (
            <div key={item.id} className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold`} style={{ backgroundColor: getSleepColor(item.duration) + '30', color: getSleepColor(item.duration) }}>
                  {item.duration}h
                </div>
                <div>
                  <p className="text-white font-medium">{formatDate(item.date)}</p>
                  <p className="text-gray-400 text-sm">{item.bedtime} → {item.wakeTime} · {'⭐'.repeat(item.quality)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300" aria-label="Edit">✏️</button>
                <button onClick={() => setDeleteId(item.id)} className="text-red-400 hover:text-red-300" aria-label="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Sleep Entry" message="Are you sure?" confirmText="Delete" />
    </div>
  );
};

export default Sleep;
