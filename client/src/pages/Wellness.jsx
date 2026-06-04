import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWellnessScore, fetchWellnessHistory } from '../store/wellnessSlice';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar } from 'recharts';
import Skeleton from '../components/Skeleton';
import { getScoreColor } from '../utils/helpers';

const Wellness = () => {
  const dispatch = useDispatch();
  const { score, breakdown, history, loading } = useSelector(s => s.wellness);

  useEffect(() => {
    dispatch(fetchWellnessScore());
    dispatch(fetchWellnessHistory({ days: 30 }));
  }, [dispatch]);

  if (loading) return <div className="space-y-6"><Skeleton type="card" count={4} /><Skeleton type="chart" /></div>;

  const gaugeData = [{ name: 'Score', value: score || 0, fill: getScoreColor(score || 0) }];
  const breakdownItems = breakdown ? [
    { label: 'Activity', score: breakdown.activity.score, max: breakdown.activity.max, color: '#3b82f6', icon: '🏃' },
    { label: 'Sleep', score: breakdown.sleep.score, max: breakdown.sleep.max, color: '#8b5cf6', icon: '😴' },
    { label: 'Hydration', score: breakdown.hydration.score, max: breakdown.hydration.max, color: '#06b6d4', icon: '💧' },
    { label: 'Consistency', score: breakdown.consistency.score, max: breakdown.consistency.max, color: '#f59e0b', icon: '🔥' },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-white">Wellness Score</h1><p className="text-gray-400 text-sm">Your overall health rating</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gauge */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
          <div className="relative">
            <ResponsiveContainer width={240} height={240}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: '#1f293740' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold" style={{ color: getScoreColor(score || 0) }}>{score || 0}</span>
              <span className="text-sm text-gray-400">out of 100</span>
            </div>
          </div>
          <div className="mt-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: getScoreColor(score || 0) + '30', color: getScoreColor(score || 0) }}>
            {(score || 0) >= 80 ? 'Excellent!' : (score || 0) >= 60 ? 'Good' : (score || 0) >= 40 ? 'Fair' : 'Needs improvement'}
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Score Breakdown</h2>
          {breakdownItems.map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300 flex items-center gap-2"><span>{item.icon}</span>{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.score}/{item.max}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${(item.score / item.max) * 100}%`, backgroundColor: item.color }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 30-day History */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">30-Day Score History</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={d => new Date(d).getDate()} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
            <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} name="Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Wellness;
