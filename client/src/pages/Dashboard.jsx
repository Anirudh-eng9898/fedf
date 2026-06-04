import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWellnessScore } from '../store/wellnessSlice';
import { fetchActivities } from '../store/activitySlice';
import { fetchSleep } from '../store/sleepSlice';
import { fetchHydration } from '../store/hydrationSlice';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getGreeting, getToday, getDaysAgo } from '../utils/helpers';
import Skeleton from '../components/Skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wellness = useSelector(s => s.wellness);
  const activity = useSelector(s => s.activity);
  const sleep = useSelector(s => s.sleep);
  const hydration = useSelector(s => s.hydration);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(fetchWellnessScore()),
        dispatch(fetchActivities({ page: 1, limit: 100, from: getDaysAgo(7) })),
        dispatch(fetchSleep({ from: getDaysAgo(7) })),
        dispatch(fetchHydration({ date: getToday() }))
      ]);
      setLoading(false);
    };
    load();
  }, [dispatch]);

  useEffect(() => {
    // Build weekly chart data
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = getDaysAgo(i);
      const dayActs = activity.items.filter(a => a.date === d);
      const daySleep = sleep.items.filter(s => s.date === d);
      const label = new Date(d).toLocaleDateString('en', { weekday: 'short' });
      data.push({
        day: label,
        activity: dayActs.reduce((s, a) => s + a.duration, 0),
        sleep: daySleep.reduce((s, e) => s + e.duration, 0),
      });
    }
    setWeeklyData(data);
  }, [activity.items, sleep.items]);

  const todayIntake = hydration.dailyTotals?.[getToday()] || 0;
  const todayActivity = activity.items.filter(a => a.date === getToday()).reduce((s, a) => s + a.duration, 0);
  const lastSleep = sleep.items.length > 0 ? sleep.items[0] : null;

  const kpiCards = [
    { label: 'Activity Today', value: `${todayActivity} min`, icon: '🏃', color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30' },
    { label: 'Sleep (Last Night)', value: lastSleep ? `${lastSleep.duration}h` : '—', icon: '😴', color: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30' },
    { label: 'Water Intake', value: `${todayIntake} ml`, icon: '💧', color: 'from-cyan-500/20 to-cyan-600/20', border: 'border-cyan-500/30' },
    { label: 'Wellness Score', value: wellness.score !== null ? `${wellness.score}/100` : '—', icon: '💚', color: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-500/30' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton type="card" count={4} />
        </div>
        <Skeleton type="chart" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-200`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Log Activity', path: '/activity', icon: '🏃' },
          { label: 'Log Sleep', path: '/sleep', icon: '😴' },
          { label: 'Log Hydration', path: '/hydration', icon: '💧' },
        ].map(action => (
          <button key={action.label} onClick={() => navigate(action.path)}
            className="px-5 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2"
            aria-label={action.label}>
            <span>{action.icon}</span> {action.label}
          </button>
        ))}
      </div>

      {/* Weekly Summary Chart */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Weekly Summary</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Bar dataKey="activity" fill="#3b82f6" name="Activity (min)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sleep" fill="#8b5cf6" name="Sleep (hrs)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
