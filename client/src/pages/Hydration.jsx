import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHydration, createHydration, removeHydration } from '../store/hydrationSlice';
import { useNotifications } from '../context/NotificationContext';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import { getToday, getHydrationColor, formatDate } from '../utils/helpers';

const QUICK_AMOUNTS = [250, 500, 750];

const Hydration = () => {
  const dispatch = useDispatch();
  const { entries, dailyTotals, loading } = useSelector(s => s.hydration);
  const { addToast } = useNotifications();
  const [customAmount, setCustomAmount] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const today = getToday();
  const todayTotal = dailyTotals[today] || 0;
  const goal = 2500;
  const pct = Math.min(100, Math.round((todayTotal / goal) * 100));

  useEffect(() => { dispatch(fetchHydration({ date: today })); }, [dispatch, today]);

  const handleAdd = async (amount) => {
    try {
      await dispatch(createHydration({ amount, date: today })).unwrap();
      addToast(`+${amount}ml logged!`, 'success');
      dispatch(fetchHydration({ date: today }));
    } catch (err) { addToast(err || 'Failed', 'error'); }
  };

  const handleCustom = () => {
    const amt = parseInt(customAmount);
    if (!amt || amt < 1) { addToast('Enter a valid amount', 'error'); return; }
    handleAdd(amt);
    setCustomAmount('');
  };

  const handleDelete = async () => {
    try {
      await dispatch(removeHydration(deleteId)).unwrap();
      addToast('Entry removed', 'success');
      setDeleteId(null);
      dispatch(fetchHydration({ date: today }));
    } catch (err) { addToast(err || 'Failed', 'error'); }
  };

  const chartData = [{ name: 'Intake', value: pct, fill: getHydrationColor(pct) }];
  const todayEntries = entries.filter(e => e.date === today);

  if (loading) return <div className="space-y-6"><Skeleton type="card" count={2} /><Skeleton type="chart" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-white">Hydration Tracker</h1><p className="text-gray-400 text-sm">Stay hydrated throughout the day</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circular Progress */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Progress</h2>
          <div className="relative">
            <ResponsiveContainer width={220} height={220}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={chartData} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: '#1f293740' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{pct}%</span>
              <span className="text-sm text-gray-400">{todayTotal}/{goal} ml</span>
            </div>
          </div>
          <div className={`mt-4 px-4 py-2 rounded-xl text-sm font-medium ${pct >= 80 ? 'bg-emerald-500/20 text-emerald-300' : pct >= 50 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
            {pct >= 100 ? '🎉 Goal reached!' : pct >= 80 ? '💪 Almost there!' : pct >= 50 ? '👍 Keep going!' : '💧 Drink more water!'}
          </div>
        </div>

        {/* Quick Add */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Add</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {QUICK_AMOUNTS.map(amt => (
              <button key={amt} onClick={() => handleAdd(amt)}
                className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 font-bold hover:bg-cyan-500/20 transition-all text-center"
                aria-label={`Add ${amt}ml`}>
                <span className="text-2xl block mb-1">💧</span>
                +{amt}ml
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="Custom ml" aria-label="Custom amount" />
            <button onClick={handleCustom} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors" aria-label="Add custom amount">Add</button>
          </div>
        </div>
      </div>

      {/* Today's Log */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Today's Intake Log</h2>
        {todayEntries.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No entries yet. Start drinking!</p>
        ) : (
          <div className="space-y-2">
            {todayEntries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💧</span>
                  <span className="text-white font-medium">{entry.amount} ml</span>
                  <span className="text-gray-500 text-xs">{new Date(entry.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <button onClick={() => setDeleteId(entry.id)} className="text-red-400 hover:text-red-300" aria-label="Delete entry">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Entry" message="Remove this hydration entry?" confirmText="Delete" />
    </div>
  );
};

export default Hydration;
