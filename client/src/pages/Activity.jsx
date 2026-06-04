import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities, createActivity, updateActivity, removeActivity } from '../store/activitySlice';
import { useNotifications } from '../context/NotificationContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { getToday, formatDate } from '../utils/helpers';

const TYPES = ['Walking', 'Running', 'Cycling', 'Gym', 'Yoga', 'Other'];
const INTENSITIES = ['Low', 'Medium', 'High'];

const Activity = () => {
  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector(s => s.activity);
  const { addToast } = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ type: 'Walking', duration: '', intensity: 'Medium', date: getToday(), notes: '' });
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch(fetchActivities({ page, limit: 10, type: filterType || undefined })); }, [dispatch, page, filterType]);

  const validate = () => {
    const e = {};
    if (!form.type) e.type = 'Required';
    if (!form.duration || parseInt(form.duration) < 1) e.duration = 'Must be at least 1 minute';
    if (!form.intensity) e.intensity = 'Required';
    if (!form.date) e.date = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editId) {
        await dispatch(updateActivity({ id: editId, data: form })).unwrap();
        addToast('Activity updated!', 'success');
      } else {
        await dispatch(createActivity(form)).unwrap();
        addToast('Activity logged!', 'success');
      }
      resetForm();
      dispatch(fetchActivities({ page, limit: 10, type: filterType || undefined }));
    } catch (err) { addToast(err || 'Failed', 'error'); }
  };

  const handleEdit = (item) => {
    setForm({ type: item.type, duration: item.duration.toString(), intensity: item.intensity, date: item.date, notes: item.notes || '' });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await dispatch(removeActivity(deleteId)).unwrap();
      addToast('Activity deleted', 'success');
      setDeleteId(null);
    } catch (err) { addToast(err || 'Failed', 'error'); }
  };

  const resetForm = () => {
    setForm({ type: 'Walking', duration: '', intensity: 'Medium', date: getToday(), notes: '' });
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const inputCls = (field) => `w-full px-4 py-3 bg-gray-800 border ${errors[field] ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-gray-400 text-sm">Track your physical activities</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors" aria-label="Log activity">
          {showForm ? 'Cancel' : '+ Log Activity'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Activity Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputCls('type')} aria-label="Activity type">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="mt-1 text-xs text-red-400">{errors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
              <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className={inputCls('duration')} placeholder="30" aria-label="Duration" />
              {errors.duration && <p className="mt-1 text-xs text-red-400">{errors.duration}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Intensity</label>
              <select value={form.intensity} onChange={e => setForm({ ...form, intensity: e.target.value })} className={inputCls('intensity')} aria-label="Intensity">
                {INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls('date')} aria-label="Date" />
              {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls('notes')} rows={2} placeholder="Optional notes..." aria-label="Notes" />
          </div>
          <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors" aria-label="Save activity">
            {editId ? 'Update' : 'Save'} Activity
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none" aria-label="Filter by type">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? <Skeleton type="table" count={5} /> : items.length === 0 ? (
        <EmptyState icon="🏃" title="No activities yet" message="Start logging your workouts to track progress" actionLabel="Log Activity" onAction={() => setShowForm(true)} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="pb-3 px-4">Date</th><th className="pb-3 px-4">Type</th><th className="pb-3 px-4">Duration</th>
                  <th className="pb-3 px-4">Intensity</th><th className="pb-3 px-4">Calories</th><th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-gray-300">{formatDate(item.date)}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs">{item.type}</span></td>
                    <td className="py-3 px-4 text-white font-medium">{item.duration} min</td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-lg text-xs ${item.intensity === 'High' ? 'bg-red-500/20 text-red-300' : item.intensity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>{item.intensity}</span></td>
                    <td className="py-3 px-4 text-orange-300">{item.calories} kcal</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300 text-xs" aria-label="Edit activity">✏️</button>
                      <button onClick={() => setDeleteId(item.id)} className="text-red-400 hover:text-red-300 text-xs" aria-label="Delete activity">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${page === i + 1 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Activity" message="Are you sure? This action cannot be undone." confirmText="Delete" confirmColor="red" />
    </div>
  );
};

export default Activity;
