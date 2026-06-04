import { useEffect, useState } from 'react';
import { historyService } from '../services/services';
import { useNotifications } from '../context/NotificationContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { formatDate, getDaysAgo } from '../utils/helpers';
import { activityService, sleepService, hydrationService } from '../services/services';

const TABS = ['All', 'Activity', 'Sleep', 'Hydration'];

const History = () => {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useNotifications();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, type: tab === 'All' ? undefined : tab.toLowerCase(), search: search || undefined, from: dateFrom || undefined, to: dateTo || undefined };
      const res = await historyService.getAll(params);
      setEntries(res.data.data.entries);
      setPagination(res.data.data.pagination);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tab, page, search, dateFrom, dateTo]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { id, entryType } = deleteTarget;
      if (entryType === 'activity') await activityService.delete(id);
      else if (entryType === 'sleep') await sleepService.delete(id);
      else if (entryType === 'hydration') await hydrationService.delete(id);
      addToast('Entry deleted', 'success');
      setDeleteTarget(null);
      fetchData();
    } catch { addToast('Failed to delete', 'error'); }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Details'];
    const rows = entries.map(e => [e.date || '', e.entryType, e.type || e.duration || e.amount || '']);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'wellness_history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white">History</h1><p className="text-gray-400 text-sm">View all your wellness entries</p></div>
        <button onClick={handleExportCSV} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors text-sm">📥 Export CSV</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          placeholder="Search..." aria-label="Search history" />
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none" aria-label="Date from" />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none" aria-label="Date to" />
      </div>

      {/* Table */}
      {loading ? <Skeleton type="table" count={10} /> : entries.length === 0 ? (
        <EmptyState icon="📜" title="No entries" message="Start logging to build your history" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead><tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="pb-3 px-4">Date</th><th className="pb-3 px-4">Type</th><th className="pb-3 px-4">Details</th><th className="pb-3 px-4">Actions</th>
              </tr></thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-gray-300">{formatDate(e.date || e.timestamp)}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-lg text-xs ${e.entryType === 'activity' ? 'bg-blue-500/20 text-blue-300' : e.entryType === 'sleep' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>{e.entryType}</span></td>
                    <td className="py-3 px-4 text-white">
                      {e.entryType === 'activity' ? `${e.type} - ${e.duration}min (${e.calories}kcal)` :
                       e.entryType === 'sleep' ? `${e.duration}h sleep (${e.quality}⭐)` :
                       `${e.amount}ml water`}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => setDeleteTarget({ id: e.id, entryType: e.entryType })} className="text-red-400 hover:text-red-300" aria-label="Delete entry">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${page === i + 1 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Entry" message="Permanently delete this entry?" confirmText="Delete" />
    </div>
  );
};

export default History;
