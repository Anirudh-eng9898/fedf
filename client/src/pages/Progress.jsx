import { useEffect, useState } from 'react';
import { progressService } from '../services/services';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import Skeleton from '../components/Skeleton';
import { getDaysAgo } from '../utils/helpers';

const Progress = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await progressService.getAll({ from: getDaysAgo(range), to: getDaysAgo(0) });
        setData(res.data.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetch();
  }, [range]);

  if (loading) return <div className="space-y-6"><Skeleton type="chart" /><Skeleton type="chart" /></div>;

  const fmt = d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white">Progress Charts</h1><p className="text-gray-400 text-sm">Visualize your wellness journey</p></div>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setRange(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${range === d ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">🏃 Activity (min/day)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={fmt} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
              <Bar dataKey="activityMinutes" fill="#3b82f6" name="Minutes" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">😴 Sleep (hrs/night)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={fmt} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="sleepHours" stroke="#8b5cf6" strokeWidth={2} name="Hours" />
              <Line type="monotone" dataKey="sleepQuality" stroke="#f59e0b" strokeWidth={2} name="Quality" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hydration */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">💧 Hydration (ml/day)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={fmt} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
              <ReferenceLine y={2500} stroke="#06b6d4" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#06b6d4', fontSize: 10 }} />
              <Area type="monotone" dataKey="hydrationMl" stroke="#06b6d4" fill="#06b6d420" strokeWidth={2} name="Intake (ml)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Wellness Score */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">💚 Wellness Score</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={fmt} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} name="Score">
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Progress;
